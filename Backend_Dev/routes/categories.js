// routes/categories.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Get all categories
router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
            [req.session.userId]
        );

        // Get task count for each category
        for (let category of categories) {
            const [count] = await db.query(
                'SELECT COUNT(*) as total FROM tasks WHERE category_id = ? AND user_id = ?',
                [category.id, req.session.userId]
            );
            category.task_count = count[0].total;
        }

        res.render('categories', {
            user: req.session,
            categories,
            page: 'categories'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Create category
router.post('/create', async (req, res) => {
    const { name, color, icon } = req.body;
    const db = req.app.locals.db;

    try {
        await db.query(
            'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)',
            [name, color || '#007bff', icon || 'fa-folder', req.session.userId]
        );

        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Update category
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const db = req.app.locals.db;

    try {
        await db.query(
            'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
            [name, color, icon, id, req.session.userId]
        );

        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Delete category
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        // Check if category has tasks
        const [tasks] = await db.query(
            'SELECT COUNT(*) as total FROM tasks WHERE category_id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (tasks[0].total > 0) {
            // Set category_id to NULL for tasks in this category
            await db.query(
                'UPDATE tasks SET category_id = NULL WHERE category_id = ? AND user_id = ?',
                [id, req.session.userId]
            );
        }

        // Delete category
        await db.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

// Get category by ID (API)
router.get('/api/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;