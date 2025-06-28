

const Task = require('../models/Task');

module.exports = async function cleanupOldTasks(req, res, next){
    try{
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        await Task.deleteMany({
            userId : req.user.id,
            scheduledFor: {$lt : oneMonthAgo}
        });
        next();
    }
    catch(err){
        console.error('Task cleanuup failed:', err);
        next();
    }
}