// app.js - Main Application File
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make pool available globally
app.locals.db = pool;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);

// Home Route
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        const [tasks] = await pool.query(
            `SELECT t.*, c.name as category_name, c.color as category_color 
             FROM tasks t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? 
             ORDER BY t.deadline ASC, t.priority DESC`,
            [req.session.userId]
        );

        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE user_id = ?',
            [req.session.userId]
        );

        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'sudah selesai').length,
            pending: tasks.filter(t => t.status === 'belum selesai').length,
            high: tasks.filter(t => t.priority === 'high' && t.status === 'belum selesai').length
        };

        res.render('dashboard', {
            user: req.session,
            tasks,
            categories,
            stats,
            page: 'dashboard'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Test Database Connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
    });

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
