// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { isGuest } = require('../middleware/auth');

// Login Page
router.get('/login', isGuest, (req, res) => {
    res.render('login', { 
        error: null,
        page: 'login'
    });
});

// Login Process
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = req.app.locals.db;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.render('login', { 
                error: 'Username atau email tidak ditemukan',
                page: 'login'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render('login', { 
                error: 'Password salah',
                page: 'login'
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.role = user.role;

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
            error: 'Terjadi kesalahan server',
            page: 'login'
        });
    }
});

// Register Page
router.get('/register', isGuest, (req, res) => {
    res.render('register', { 
        error: null,
        success: null,
        page: 'register'
    });
});

// Register Process
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const db = req.app.locals.db;

    try {
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.render('register', { 
                error: 'Semua field harus diisi',
                success: null,
                page: 'register'
            });
        }

        if (password !== confirmPassword) {
            return res.render('register', { 
                error: 'Password tidak cocok',
                success: null,
                page: 'register'
            });
        }

        if (password.length < 6) {
            return res.render('register', { 
                error: 'Password minimal 6 karakter',
                success: null,
                page: 'register'
            });
        }

        // Check existing user
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.render('register', { 
                error: 'Username atau email sudah terdaftar',
                success: null,
                page: 'register'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, 'user']
        );

        // Create default categories for new user
        const defaultCategories = [
            ['Personal', '#28a745', 'fa-user', result.insertId],
            ['Work', '#007bff', 'fa-briefcase', result.insertId],
            ['Study', '#ffc107', 'fa-book', result.insertId],
            ['Health', '#dc3545', 'fa-heartbeat', result.insertId]
        ];

        await db.query(
            'INSERT INTO categories (name, color, icon, user_id) VALUES ?',
            [defaultCategories]
        );

        res.render('register', { 
            error: null,
            success: 'Registrasi berhasil! Silakan login.',
            page: 'register'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.render('register', { 
            error: 'Terjadi kesalahan server',
            success: null,
            page: 'register'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
