// routes/tasks.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Get all tasks
router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const [tasks] = await db.query(
            `SELECT t.*, c.name as category_name, c.color as category_color 
             FROM tasks t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? 
             ORDER BY t.deadline ASC`,
            [req.session.userId]
        );

        const [categories] = await db.query(
            'SELECT * FROM categories WHERE user_id = ?',
            [req.session.userId]
        );

        res.render('tasks', {
            user: req.session,
            tasks,
            categories,
            page: 'tasks'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Create task
router.post('/create', async (req, res) => {
    const { title, description, deadline, priority, category_id } = req.body;
    const db = req.app.locals.db;

    try {
        await db.query(
            'INSERT INTO tasks (title, description, deadline, priority, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, deadline, priority, category_id || null, req.session.userId]
        );

        res.redirect('/tasks');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Update task
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, deadline, priority, category_id, status } = req.body;
    const db = req.app.locals.db;

    try {
        await db.query(
            `UPDATE tasks 
             SET title = ?, description = ?, deadline = ?, priority = ?, category_id = ?, status = ?
             WHERE id = ? AND user_id = ?`,
            [title, description, deadline, priority, category_id || null, status, id, req.session.userId]
        );

        res.redirect('/tasks');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Toggle task status
router.post('/toggle/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        await db.query(
            `UPDATE tasks 
             SET status = CASE 
                 WHEN status = 'belum selesai' THEN 'sudah selesai'
                 ELSE 'belum selesai'
             END
             WHERE id = ? AND user_id = ?`,
            [id, req.session.userId]
        );

        res.redirect('/tasks');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Delete task
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        await db.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        res.redirect('/tasks');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Get task by ID (API)
router.get('/api/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        const [tasks] = await db.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(tasks[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
