// routes/users.js - Admin Only
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

// Get all users
router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );

        // Get task count for each user
        for (let user of users) {
            const [count] = await db.query(
                'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?',
                [user.id]
            );
            user.task_count = count[0].total;
        }

        res.render('users', {
            user: req.session,
            users,
            page: 'users'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Create user (Admin)
router.post('/create', async (req, res) => {
    const { username, email, password, role } = req.body;
    const db = req.app.locals.db;

    try {
        // Validation
        if (!username || !email || !password) {
            return res.status(400).send('Semua field harus diisi');
        }

        // Check existing user
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).send('Username atau email sudah terdaftar');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'user']
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

        res.redirect('/users');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Update user
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    const db = req.app.locals.db;

    try {
        if (password && password.length > 0) {
            // Update with new password
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE id = ?',
                [username, email, role, hashedPassword, id]
            );
        } else {
            // Update without changing password
            await db.query(
                'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
                [username, email, role, id]
            );
        }

        res.redirect('/users');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Delete user
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        // Prevent deleting own account
        if (parseInt(id) === req.session.userId) {
            return res.status(400).send('Tidak dapat menghapus akun sendiri');
        }

        // Delete user (cascade will delete tasks and categories)
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.redirect('/users');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Get user by ID (API)
router.get('/api/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
