const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const requireAuth = require('./middleware/requireAuth');
const methodOverride = require('method-override');
const serverless = require('serverless-http');
const path = require('path');

dotenv.config();

const app = express();

// Debug logs
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Absolute paths using __dirname
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

app.use('/styles', express.static(path.join(__dirname, '../client/styles')));
app.use(express.static(path.join(__dirname, '../client/public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.get('/', (req, res) => res.render('home'));
app.get('/dashboard', requireAuth, (req, res) => res.redirect('/tasks'));

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.use((req, res) => {
    res.status(404).render('404', { url: req.originalUrl });
});

// ✅ Conditional local server start
if (process.env.VERCEL !== "1") {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB connected successfully');
            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
                console.log(`Local server running on http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

// ✅ Required for Vercel serverless deployment
module.exports = app;
module.exports.handler = serverless(app);
