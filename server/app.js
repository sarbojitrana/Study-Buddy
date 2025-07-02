const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const requireAuth = require('./middleware/requireAuth');
const methodOverride = require('method-override');



dotenv.config();

const app = express();

app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
    next();
});




app.use('/styles', express.static('client/styles'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use(methodOverride('_method'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', 'client/views');

// Static files
app.use(express.static('client/public'));

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes); // Protected task routes

// Public routes
app.get('/', (req, res) => {
    res.render('home');
});

// Dashboard route - protected
app.get('/dashboard', requireAuth, (req, res) => {
    res.redirect('/tasks');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', { 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { url: req.originalUrl });
});

// Database connection and server startup
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if database connection fails
    });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});