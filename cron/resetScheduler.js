const cron = require('node-cron');
const { readJsonFile, writeJsonFile } = require('../app/utils');

const ACTIVITY_FILE = './datas/activity.json';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const data = await readJsonFile(ACTIVITY_FILE);
        const today = new Date().toISOString().split('T')[0];

        console.log(`[CRON] Resetting roomsCleanedToday for ${today}`);
        data.roomsCleanedToday = 0;
        data.lastResetDate = today;

        await writeJsonFile(ACTIVITY_FILE, data);
        console.log('[CRON] Reset successful.');
    } catch (err) {
        console.error('[CRON] Failed to reset stats:', err);
    }
});