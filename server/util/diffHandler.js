const Calendar = require('../schemas/calendarSchema');
const deepDiff = require('deep-diff');

const mapGoogleCalendarToSchema = (gCal, userId) => ({
    userId,
    kind: gCal.kind,
    etag: gCal.etag,
    id: gCal.id,
    summary: gCal.summary,
    timeZone: gCal.timeZone,
    colorId: gCal.colorId,
    backgroundColor: gCal.backgroundColor,
    foregroundColor: gCal.foregroundColor,
    accessRole: gCal.accessRole
});

const processCalendarUpdates = async (userId, googleCalendars) => {
    console.log(`🚀 Processing calendar updates for user: ${userId}`);

    const dbCalendars = await Calendar.find({ userId });

    // Create maps for easy comparison
    const googleCalendarsMap = new Map(googleCalendars.map(c => [c.id, mapGoogleCalendarToSchema(c, userId)]));
    const dbCalendarsMap = new Map(dbCalendars.map(c => [c.id, c.toObject()]));

    const bulkOperations = [];
    let createdCount = 0, updatedCount = 0, deletedCount = 0;

    // 🔄 Check for new and updated calendars
    googleCalendarsMap.forEach((gCal, id) => {
        const dbCal = dbCalendarsMap.get(id);

        if (!dbCal) {
            console.log(`🆕 New calendar detected: ${gCal.summary} (ID: ${id})`);
            bulkOperations.push({ insertOne: { document: {...gCal, userId} } });
            createdCount++;
        } else {
            // Remove MongoDB metadata before diffing
            delete dbCal._id;
            delete dbCal.__v;
            
            const diff = deepDiff(dbCal, gCal);
            if (diff) {
                console.log(`✏️ Calendar updated: ${gCal.summary} (ID: ${id})`);
                bulkOperations.push({
                    updateOne: {
                        filter: { id: gCal.id },
                        update: { $set: gCal }
                    }
                });
                updatedCount++;
            }
        }
    });

    // 🗑️ Check for deleted calendars
    dbCalendarsMap.forEach((dbCal, id) => {
        if (!googleCalendarsMap.has(id)) {
            console.log(`🗑️ Calendar deleted: ${dbCal.summary} (ID: ${id})`);
            bulkOperations.push({ deleteOne: { filter: { id } } });
            deletedCount++;
        }
    });

    // ✅ Execute bulk operation if there are any changes
    if (bulkOperations.length > 0) {
        await Calendar.bulkWrite(bulkOperations);
        console.log(`✅ Calendar updates complete: Created: ${createdCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`);
    } else {
        console.log(`⚡ No changes detected in calendars.`);
    }

    return {
        status: 'success',
        count: {
            created: createdCount,
            updated: updatedCount,
            deleted: deletedCount
        }
    };
};

module.exports = {
    processCalendarUpdates
};
