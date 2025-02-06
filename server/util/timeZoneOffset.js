const getTimeRange = (timeRange, timeZone) => {
    const now = new Date();
    const timeMin = convertToTimeZone(now, timeZone);
    const timeMax = convertToTimeZone(now, timeZone);
    let dayOfWeek;

    switch (timeRange) {
        case 'today':
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(23, 59, 59, 999);
            break;
        case 'tomorrow':
            timeMin.setDate(now.getDate() + 1);
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setDate(now.getDate() + 1);
            timeMax.setHours(23, 59, 59, 999);
            break;
        case 'week-s':  // Week starts on **Sunday** (Sunday to Saturday)
            dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
            timeMin.setDate(now.getDate() - dayOfWeek); // Move to Sunday
            timeMin.setHours(0, 0, 0, 0);

            console.log("Start of week (Sunday):", timeMin.toISOString());

            timeMax.setDate(timeMin.getDate() + 7); // Move to Sunday (exclusive)
            timeMax.setHours(0, 0, 0, 0);

            console.log("End of week (Saturday):", timeMax.toISOString());
            break;
        case 'week-m':  // Week starts on **Monday** (Monday to Sunday)
            dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Move to previous Monday
            timeMin.setDate(now.getDate() + mondayOffset);
            timeMin.setHours(0, 0, 0, 0);

            console.log("Start of week (Monday):", timeMin.toISOString());

            timeMax.setDate(timeMin.getDate() + 7); // Move to Sunday
            timeMax.setHours(0, 0, 0, 0);

            console.log("End of week (Sunday):", timeMax.toISOString());
            break;
        case 'month':
            timeMin.setDate(1); // Set to first day of the month
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setMonth(now.getMonth() + 1, 0); // Set to last day of current month
            timeMax.setHours(23, 59, 59, 999);
            break;
        default:
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(23, 59, 59, 999);

    }
    return {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString()
    };
};

const getTimeZone = (req) => {
    let tz = req.headers['time-zone'] || req.headers['tz'] || null;

    if (!tz) {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone;  // Gets timezone from JS runtime
        console.log(`🌐 Timezone detected as: ${tz}`);
    }

    return tz || 'UTC';  // Default to UTC if no timezone is found
};

const convertToTimeZone = (date, timeZone) => {
    return new Date(
        new Date(date.toLocaleString('en-US', { timeZone })).toISOString()
    );
};

module.exports = { getTimeRange, getTimeZone };