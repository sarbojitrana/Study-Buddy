
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const requireAuth = require('./middleware/requireAuth');
const User = require('./models/User');
const taskRoutes = require('./routes/taskRoutes');



dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use('/auth', authRoutes);




app.use(express.static('client/public'));
app.use('/tasks', taskRoutes);

app.set('view engine', 'ejs')
app.set('views', 'client/views');



app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/dashboard', requireAuth, (req, res) => {
    res.redirect('/tasks');
});





app.get('/', (req, res) =>{
    res.render('home') ;
});



mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, ()=>{
        console.log(`Server is running on PORT ${PORT}`);
    });
})
.catch(err =>{
    console.error('MongoDB connection error: ', err);
})