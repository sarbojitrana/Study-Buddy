const express = require('express');
const Task = require('../models/Task');
const requireAuth = require('../middleware/requireAuth');
const cleanupOldTasks = require('../middleware/cleanupOldTasks');

const router = express.Router();

router.use(requireAuth);
router.use(cleanupOldTasks);

// DASHBOARD VIEW
router.get('/', async (req, res) => {
    const tasks = await Task.find({ userId: req.user.id }).sort({ scheduledFor: 1 });
    res.render('dashboard', { user: req.user, tasks });
});

// MONTHLY CALENDAR VIEW
router.get('/calendar', async (req, res) => {
    const monthParam = req.query.month;
    const now = new Date();

    const target = monthParam ? new Date(monthParam + "-01") : now;

    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59);

    const tasks = await Task.find({
        userId: req.user._id,
        scheduledFor: { $gte: start, $lte: end }
    });

    res.render('calendar', {
        tasks,
        currentMonth: start,
        previousMonth: new Date(start.getFullYear(), start.getMonth() - 1, 1),
        nextMonth: new Date(start.getFullYear(), start.getMonth() + 1, 1)
    });

});

// DAILY TASK VIEW
router.get('/day/:date', async (req, res) => {
    const datePrefix = req.params.date;
    const start = new Date(`${datePrefix}T00:00:00.000Z`);
    const end = new Date(`${datePrefix}T23:59:59.999Z`);

    const tasks = await Task.find({
        userId: req.user.id,
        scheduledFor: { $gte: start, $lte: end }
    });

    res.render('day', { tasks, date: datePrefix });
});

// CREATE TASK
router.post('/create', async (req, res) => {
    const { title, description, scheduledFor } = req.body;
    await Task.create({
        userId: req.user._id,
        title,
        description,
        scheduledFor
    });
    res.redirect('/dashboard');
});

// UPDATE TASK STATUS
router.post('/:id/status', async (req, res) => {
    const { status } = req.body;
    await Task.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/dashboard');
});

// DELETE TASK
router.post('/:id/delete', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
});

module.exports = router;
