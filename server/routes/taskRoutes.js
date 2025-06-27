

const express = require('express');
const Task = require('../models/Task');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async(req , res)=>{
    const tasks = await Task.find({userId: req.user.id}).sort({ scheduledFor : 1});
    res.render('dashboard', { user: req.user, tasks});
});

router.post('/create', async(req, res)=>{
    const { title , description, scheduledFor} = req.body;
    await Task.create({
        userId: req.user.id,
        title,
        description,
        scheduledFor
    });
    res.redirect('/dashboard');
})

router.post('/:id/status', async (req, res)=>{
    const {status} = req.body;
    await Task.findByIdAndUpdate( req.params.id, {status});
    res.redirect('/dashboard');
});


router.post('/:id/delete', async(req,res) =>{
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
})

module.exports = router;