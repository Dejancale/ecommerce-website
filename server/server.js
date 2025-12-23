const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const { sendEmail, emailTemplates } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-jwt-secret-key-2025-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your frontend files

// Initialize SQLite Database
const db = new sqlite3.Database('./ecommerce.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✓ Database connected');
        initializeDatabase();
    }
});

// Create database tables
function initializeDatabase() {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        oldPrice REAL,
        description TEXT,
        image TEXT,
        rating INTEGER DEFAULT 5,
        reviews_count INTEGER DEFAULT 0,
        inStock INTEGER DEFAULT 1,
        stockCount INTEGER DEFAULT 0,
        badge TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add is_admin column to existing users table if it doesn't exist
    db.run(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            // Column already exists or other error, ignore
        } else if (!err) {
            console.log('✓ Added is_admin column to users table');
        }
    });

    // Add email verification columns
    db.run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
        } else if (!err) {
            console.log('✓ Added email_verified column to users table');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN verification_token TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
        } else if (!err) {
            console.log('✓ Added verification_token column to users table');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
        } else if (!err) {
            console.log('✓ Added reset_token column to users table');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
        } else if (!err) {
            console.log('✓ Added reset_token_expires column to users table');
        }
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Add user_id column to existing orders table if it doesn't exist
    db.run(`ALTER TABLE orders ADD COLUMN user_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            // Column already exists or other error, ignore
        } else if (!err) {
            console.log('✓ Added user_id column to orders table');
        }
    });

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    console.log('✓ Database tables initialized');
}

// ==================== PRODUCTS API ====================

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(row);
    });
});

// Update product stock (internal use - after purchase)
app.put('/api/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    db.get('SELECT stockCount FROM products WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(500).json({ error: 'Product not found' });
            return;
        }

        const newStock = row.stockCount - quantity;
        const inStock = newStock > 0 ? 1 : 0;

        db.run(
            'UPDATE products SET stockCount = ?, inStock = ? WHERE id = ?',
            [newStock, inStock, id],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ 
                    success: true, 
                    newStock: newStock,
                    inStock: inStock 
                });
            }
        );
    });
});

// ==================== REVIEWS API ====================

// Get reviews for a product
app.get('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;

    db.all(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
        [productId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ reviews: rows });
        }
    );
});

// Add a review
app.post('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    const { customer_name, rating, comment } = req.body;

    // Validate input
    if (!customer_name || !rating) {
        res.status(400).json({ error: 'Name and rating are required' });
        return;
    }

    if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
    }

    // Insert review
    db.run(
        'INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)',
        [productId, customer_name, rating, comment],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Update product rating and review count
            updateProductRating(productId);

            res.json({
                success: true,
                review_id: this.lastID,
                message: 'Review added successfully'
            });
        }
    );
});

// Update product rating based on all reviews
function updateProductRating(productId) {
    db.all(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
        [productId],
        (err, rows) => {
            if (err || !rows[0]) return;

            const avgRating = Math.round(rows[0].avg_rating);
            const reviewCount = rows[0].count;

            db.run(
                'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
                [avgRating, reviewCount, productId]
            );
        }
    );
}

// ==================== ORDERS API ====================

// Create new order (authenticated and guest)
app.post('/api/orders', (req, res) => {
    const {
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        items,
        payment_method
    } = req.body;

    console.log('📦 Order request received:', { customer_name, customer_email, items_count: items?.length });

    // Check if user is authenticated (optional)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
            console.log('✓ Authenticated user:', userId);
        } catch (err) {
            console.log('⚠ Invalid token, continuing as guest');
        }
    }

    // Validate input
    if (!customer_name || !customer_email || !items || items.length === 0) {
        console.error('❌ Validation failed: Missing required fields');
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // Calculate total
    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
    });

    console.log('💰 Order total:', total);

    // Create order with optional user_id
    db.run(
        `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, customer_name, customer_email, customer_phone, customer_address, total, payment_method],
        function(err) {
            if (err) {
                console.error('❌ Database error creating order:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }

            const orderId = this.lastID;

            // Insert order items and update stock
            const itemPromises = items.map(item => {
                return new Promise((resolve, reject) => {
                    // Insert order item
                    db.run(
                        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                        [orderId, item.product_id, item.product_name, item.quantity, item.price],
                        (err) => {
                            if (err) reject(err);
                            else {
                                // Update stock
                                db.run(
                                    'UPDATE products SET stockCount = stockCount - ? WHERE id = ?',
                                    [item.quantity, item.product_id],
                                    (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    }
                                );
                            }
                        }
                    );
                });
            });

            Promise.all(itemPromises)
                .then(async () => {
                    // Send order confirmation email
                    try {
                        const order = {
                            id: orderId,
                            full_name: customer_name,
                            address: customer_address,
                            city: '',
                            postal_code: '',
                            country: '',
                            phone: customer_phone,
                            total_amount: total
                        };
                        await sendEmail(
                            customer_email,
                            emailTemplates.orderConfirmation(order, items)
                        );
                    } catch (emailErr) {
                        console.error('⚠️ Failed to send order confirmation email:', emailErr);
                        // Don't fail the order if email fails
                    }

                    res.json({
                        success: true,
                        order_id: orderId,
                        message: 'Order created successfully',
                        total: total
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: 'Error processing order items' });
                });
        }
    );
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;

    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        // Get order items
        db.all(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderId],
            (err, items) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                order.items = items;
                res.json(order);
            }
        );
    });
});

// Get all orders (for admin)
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ orders: rows });
    });
});

// ==================== AUTHENTICATION MIDDLEWARE ====================

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== USER AUTHENTICATION API ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, phone, address, city, postalCode, country } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    try {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (row) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.run(
                `INSERT INTO users (email, password, first_name, last_name, phone, address, city, postal_code, country) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, hashedPassword, firstName, lastName, phone, address, city, postalCode, country],
                async function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    const userId = this.lastID;

                    // Generate JWT token
                    const token = jwt.sign(
                        { id: userId, email: email },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.json({
                        success: true,
                        token: token,
                        user: {
                            id: userId,
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            address: address,
                            city: city,
                            postalCode: postalCode,
                            country: country,
                            is_admin: 0
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login user
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        try {
            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    postalCode: user.postal_code,
                    country: user.country,
                    is_admin: user.is_admin
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                address: user.address,
                city: user.city,
                postalCode: user.postal_code,
                country: user.country,
                is_admin: user.is_admin
            }
        });
    });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const { firstName, lastName, phone, address, city, postalCode, country } = req.body;

    db.run(
        `UPDATE users 
         SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, country = ?
         WHERE id = ?`,
        [firstName, lastName, phone, address, city, postalCode, country, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        }
    );
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        try {
            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.user.id],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        success: true,
                        message: 'Password changed successfully'
                    });
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Verify email
app.get('/api/auth/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Verification token required' });
    }

    db.run(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE verification_token = ?',
        [token],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(400).json({ error: 'Invalid or expired verification token' });
            }

            res.json({
                success: true,
                message: 'Email verified successfully!'
            });
        }
    );
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT id, first_name FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Always return success even if user doesn't exist (security best practice)
        if (!user) {
            return res.json({ 
                success: true, 
                message: 'If an account exists with that email, a password reset link has been sent.' 
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

        db.run(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, resetExpires.toISOString(), user.id],
            async (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
                await sendEmail(
                    email,
                    emailTemplates.passwordReset(resetLink, user.first_name)
                );

                res.json({ 
                    success: true, 
                    message: 'If an account exists with that email, a password reset link has been sent.' 
                });
            }
        );
    });
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    db.get(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")',
        [token],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }

            try {
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                db.run(
                    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                    [hashedPassword, user.id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        res.json({
                            success: true,
                            message: 'Password reset successfully!'
                        });
                    }
                );
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    );
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Send email to admin
        await sendEmail(
            process.env.ADMIN_EMAIL || 'admin@yourstore.com',
            emailTemplates.contactFormSubmission({ name, email, subject, message })
        );

        res.json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

// Get user's orders
app.get('/api/auth/orders', authenticateToken, (req, res) => {
    db.all(
        `SELECT o.*, 
                GROUP_CONCAT(oi.product_name || ' (x' || oi.quantity || ')') as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [req.user.id],
        (err, orders) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ orders: orders || [] });
        }
    );
});

// Get specific order details
app.get('/api/auth/orders/:id', authenticateToken, (req, res) => {
    const orderId = req.params.id;

    db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, req.user.id],
        (err, order) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Get order items
            db.all(
                'SELECT * FROM order_items WHERE order_id = ?',
                [orderId],
                (err, items) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        order: order,
                        items: items
                    });
                }
            );
        }
    );
});

// ==================== ADMIN ENDPOINTS ====================

// Quick endpoint to make user admin (for setup only)
app.post('/api/make-admin', (req, res) => {
    const { email, secret } = req.body;
    
    if (secret !== 'admin-setup-2025') {
        return res.status(403).json({ error: 'Invalid secret' });
    }
    
    db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [email], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'User is now admin' });
    });
});

// Import products from JSON (one-time setup)
app.post('/api/admin/import-products', express.json(), (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
        res.status(400).json({ error: 'Invalid products data' });
        return;
    }

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO products 
        (id, name, category, price, oldPrice, description, image, rating, reviews_count, inStock, stockCount, badge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(p => {
        stmt.run([
            p.id, p.name, p.category, p.price, p.oldPrice, p.description,
            p.image, p.rating, p.reviews, p.inStock ? 1 : 0, p.stockCount, p.badge
        ]);
    });

    stmt.finalize((err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: 'Products imported successfully' });
    });
});

// ==================== ADMIN API ====================

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        db.get('SELECT is_admin FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user || !user.is_admin) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            req.userId = decoded.id;
            next();
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get admin dashboard stats
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
    const stats = {};
    
    // Get total orders
    db.get('SELECT COUNT(*) as total FROM orders', (err, result) => {
        stats.totalOrders = result.total;
        
        // Get total revenue
        db.get('SELECT SUM(total_amount) as total FROM orders', (err, result) => {
            stats.totalRevenue = result.total || 0;
            
            // Get pending orders
            db.get('SELECT COUNT(*) as total FROM orders WHERE status = ?', ['pending'], (err, result) => {
                stats.pendingOrders = result.total;
                
                // Get total products
                db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
                    stats.totalProducts = result.total;
                    
                    // Get total users
                    db.get('SELECT COUNT(*) as total FROM users', (err, result) => {
                        stats.totalUsers = result.total;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// Get all orders (admin)
app.get('/api/admin/orders', verifyAdmin, (req, res) => {
    const query = `
        SELECT o.*, u.email as user_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `;
    
    db.all(query, [], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ orders });
    });
});

// Get order details with items (admin)
app.get('/api/admin/orders/:id', verifyAdmin, (req, res) => {
    const orderId = req.params.id;
    
    db.get('SELECT o.*, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?', [orderId], (err, order) => {
        if (err || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ order, items });
        });
    });
});

// Update order status (admin)
app.put('/api/admin/orders/:id/status', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    // First get the order details
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
        if (err || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], async function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Send status update email
            try {
                await sendEmail(
                    order.customer_email,
                    emailTemplates.orderStatusUpdate(order, status)
                );
            } catch (emailErr) {
                console.error('⚠️ Failed to send status update email:', emailErr);
                // Don't fail the status update if email fails
            }

            res.json({ success: true, message: 'Order status updated' });
        });
    });
});

// Get all users (admin)
app.get('/api/admin/users', verifyAdmin, (req, res) => {
    db.all('SELECT id, email, first_name, last_name, phone, created_at, is_admin FROM users ORDER BY created_at DESC', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users });
    });
});

// Create product (admin)
app.post('/api/admin/products', verifyAdmin, (req, res) => {
    const { name, category, price, oldPrice, description, image, stockCount, badge } = req.body;
    
    const query = `INSERT INTO products (name, category, price, oldPrice, description, image, stockCount, inStock, badge) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const inStock = stockCount > 0 ? 1 : 0;
    
    db.run(query, [name, category, price, oldPrice || null, description, image, stockCount || 0, inStock, badge || null], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, productId: this.lastID, message: 'Product created successfully' });
    });
});

// Update product (admin)
app.put('/api/admin/products/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { name, category, price, oldPrice, description, image, stockCount, badge } = req.body;
    
    const inStock = stockCount > 0 ? 1 : 0;
    const query = `UPDATE products SET name = ?, category = ?, price = ?, oldPrice = ?, description = ?, 
                   image = ?, stockCount = ?, inStock = ?, badge = ? WHERE id = ?`;
    
    db.run(query, [name, category, price, oldPrice || null, description, image, stockCount || 0, inStock, badge || null, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated successfully' });
    });
});

// Delete product (admin)
app.delete('/api/admin/products/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 ShopHub Backend Server Running!');
    console.log('='.repeat(50));
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET    /api/products`);
    console.log(`   GET    /api/products/:id`);
    console.log(`   GET    /api/products/:id/reviews`);
    console.log(`   POST   /api/products/:id/reviews`);
    console.log(`   POST   /api/orders`);
    console.log(`   GET    /api/orders/:id`);
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err);
        console.log('\n✓ Database connection closed');
        process.exit(0);
    });
});

// Server ready
