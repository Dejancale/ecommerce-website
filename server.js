const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

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

// Create new order
app.post('/api/orders', (req, res) => {
    const {
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        items,
        payment_method
    } = req.body;

    // Validate input
    if (!customer_name || !customer_email || !items || items.length === 0) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // Calculate total
    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
    });

    // Create order
    db.run(
        `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_name, customer_email, customer_phone, customer_address, total, payment_method],
        function(err) {
            if (err) {
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
                .then(() => {
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

// ==================== ADMIN ENDPOINTS ====================

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
