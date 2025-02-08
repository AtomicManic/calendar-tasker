const Calendar = require('../schemas/calendarSchema');
const Event = require('../schemas/eventSchema');
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
            bulkOperations.push({ insertOne: { document: { ...gCal, userId } } });
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

const mapGoogleEventToSchema = (gEvent, calendarId) => ({
    calendarId, // Link event to the correct calendar
    kind: gEvent.kind,
    etag: gEvent.etag,
    id: gEvent.id,
    status: gEvent.status,
    htmlLink: gEvent.htmlLink,
    created: new Date(gEvent.created),
    updated: new Date(gEvent.updated),
    summary: gEvent.summary || "No title",
    creator: {
        email: gEvent.creator?.email || "Unknown",
        self: gEvent.creator?.self || false
    },
    organizer: {
        email: gEvent.organizer?.email || "Unknown",
        self: gEvent.organizer?.self || false
    },
    start: {
        dateTime: gEvent.start?.dateTime ? new Date(gEvent.start.dateTime) : null,
        timeZone: gEvent.start?.timeZone || "UTC"
    },
    end: {
        dateTime: gEvent.end?.dateTime ? new Date(gEvent.end.dateTime) : null,
        timeZone: gEvent.end?.timeZone || "UTC"
    }
});

const processEventUpdates = async (calendarId, googleEvents) => {
    console.log(`🚀 Processing event updates for calendar: ${calendarId}`);

    // Fetch calendar from DB
    const calendar = await Calendar.findOne({ id: calendarId });
    // Fetch current events from DB
    const dbEvents = await Event.find({ calendarId: calendarId._id });

    // Create maps for easy comparison
    const googleEventsMap = new Map(googleEvents.map(e => [e.id, e]));
    const dbEventsMap = new Map(dbEvents.map(e => [e.id, e]));

    const bulkOperations = [];
    let createdCount = 0, updatedCount = 0, deletedCount = 0;

    // 🔄 Check for new and updated events
    googleEventsMap.forEach((gEvent, id) => {
        const dbEvent = dbEventsMap.get(id);
        const mappedEvent = mapGoogleEventToSchema(gEvent, calendar._id);

        if (!dbEvent) {
            console.log(`🆕 New event detected: ${mappedEvent.summary} (ID: ${calendar._id})`);
            bulkOperations.push({
                insertOne: { document: { ...mappedEvent, calendarId: calendar._id } }
            });
            createdCount++;
        } else {
            const dbEventCleaned = { ...dbEvent.toObject() };
            delete dbEventCleaned._id; // Remove MongoDB metadata
            delete dbEventCleaned.__v;

            if (deepDiff(dbEventCleaned, mappedEvent)) {
                console.log(`✏️ Event updated: ${mappedEvent.summary} (ID: ${id})`);
                bulkOperations.push({
                    updateOne: {
                        filter: { id: mappedEvent.id },
                        update: { $set: { ...mappedEvent, calendarId: calendar._id } }
                    }
                });
                updatedCount++;
            }
        }
    });

    // 🗑️ Check for deleted events
    dbEventsMap.forEach((dbEvent, id) => {
        if (!googleEventsMap.has(id)) {
            console.log(`🗑️ Event deleted: ${dbEvent.summary} (ID: ${id})`);
            bulkOperations.push({
                deleteOne: { filter: { id } }
            });
            deletedCount++;
        }
    });

    // ✅ Execute bulk operation if changes exist
    if (bulkOperations.length > 0) {
        await Event.bulkWrite(bulkOperations);
        console.log(`✅ Event updates complete: Created: ${createdCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`);
    } else {
        console.log(`⚡ No changes detected in events.`);
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
    processCalendarUpdates,
    processEventUpdates
};
