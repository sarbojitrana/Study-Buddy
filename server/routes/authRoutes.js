
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async(req, res)=>{
    const {username, email ,password} = req.body ;
    try{
        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).send("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword});
        await user.save();

        res.status(201).send('User registered');
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server error');
    }
});



router.post('/login', async(req,res)=>{
    const {email, password} = req.body ;

    try{
        const user = await User.findOne({email});
        if(!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).send('Wrong password');

        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : '1d'}
        );
        
        res.cookie('token', token,{
            httpOnly: true,
            secure: false,
            maxAge: 24*60*60*1000
        });
        res.redirect('/dashboard')
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server error');
    }
})


router.get('/logout', (req,res)=>{
    res.clearCookie('token');
    res.send('Logged out');
});

module.exports = router;