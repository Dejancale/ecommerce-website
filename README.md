# 🛍️ ShopHub E-Commerce Platform

A full-stack e-commerce platform built with React, Express.js, and SQLite featuring user authentication, order management, admin panel, and email notifications.

## ✨ Features

### 🛒 Customer Features
- **Product Browsing**: Browse 30+ products with categories, ratings, and stock info
- **Shopping Cart**: Add/remove items with real-time total calculation
- **User Authentication**: Secure registration and login with JWT tokens
- **Email Verification**: Verify email addresses on registration
- **Order Placement**: Complete checkout with customer details
- **Order Tracking**: View order history and status updates
- **Order Confirmation**: Receive email receipts for all orders
- **Password Reset**: Reset forgotten passwords via email
- **Responsive Design**: Mobile-friendly interface

### 👨‍💼 Admin Features
- **Dashboard**: Overview with revenue, orders, products, and users stats
- **Order Management**: View all orders, filter by status, update order status
- **Product Management**: CRUD operations for products (add, edit, delete)
- **User Management**: View all registered users
- **Email Notifications**: Auto-send emails when order status changes
- **Stock Management**: Track product inventory

### 📧 Email System
- Registration verification emails
- Order confirmation emails with full details
- Order status update notifications
- Contact form submissions
- Password reset emails
- Beautiful HTML email templates with purple/pink theme

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Context API for state management
- CSS3 with gradients and animations

### Backend
- Node.js
- Express.js
- SQLite3 database
- JWT authentication
- bcrypt for password hashing
- nodemailer for email sending
- dotenv for environment variables

## 📁 Project Structure

```
WebsiteTest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Toast, etc.)
│   │   ├── context/       # Context providers (Auth, Cart)
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   └── AdminProducts.jsx
│   │   └── App.jsx
│   └── package.json
│
├── server/                # Express backend
│   ├── server.js         # Main server file
│   ├── emailService.js   # Email templates and sending
│   ├── .env             # Environment variables
│   ├── .env.example     # Example environment config
│   ├── ecommerce.db     # SQLite database
│   └── package.json
│
├── PRODUCTION-GUIDE.md  # Deployment documentation
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd WebsiteTest
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../server
   # Copy .env.example to .env
   cp .env.example .env
   # Edit .env with your email credentials
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3000
   ```

6. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔐 Admin Access

### Creating an Admin Account

**Option 1: Using the utility script**
```bash
cd server
node fix-admin.js
```
This sets your main account as admin.

**Option 2: Manual database update**
```bash
cd server
sqlite3 ecommerce.db
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
.exit
```

**Default Admin:** deko_skopje@yahoo.com (already set as admin)

### Accessing Admin Panel
1. Login with admin account
2. Click the pink ⚙️ Admin button in navbar
3. Access dashboard at `/admin`

## 📧 Email Configuration

### For Development (Optional)
Emails will be logged to console if not configured.

### For Production
Update `server/.env`:

**Gmail:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**SendGrid:**
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

See [PRODUCTION-GUIDE.md](PRODUCTION-GUIDE.md) for detailed email setup.

## 🗄️ Database Schema

### Tables
- **users**: User accounts with authentication and admin status
- **products**: Product catalog with stock management
- **orders**: Customer orders with status tracking
- **order_items**: Individual items in each order
- **reviews**: Product reviews (foundation for future feature)

### Database Utilities
```bash
cd server

# Check database statistics
node check-db.js

# View detailed database info
node debug-db.js

# Set admin privileges
node fix-admin.js

# Clear all orders (testing)
node clear-orders.js
```

## 🎨 Theme Colors
- Primary Purple: `#8b5cf6`
- Primary Pink: `#ec4899`
- Gradient: `linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)`
- Dark Background: `#1a0b2e` to `#2d1b4e`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/orders` - Get user's orders

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

### Contact
- `POST /api/contact` - Submit contact form

### Admin (Requires Admin Token)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders
- `GET /api/admin/orders/:id` - Order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - All users
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## 🧪 Testing

### Manual Testing Workflow
1. **Register** a new account → Check for verification email
2. **Browse products** → Add items to cart
3. **Checkout** → Complete order → Check for confirmation email
4. **Login as admin** → View order in admin panel
5. **Update order status** → Customer receives status update email
6. **View order history** → Check "My Orders" page

### Test Accounts
- **Admin**: deko_skopje@yahoo.com
- **Customer**: dejancalekocevski@gmail.com (or create new)

## 🚀 Deployment

See [PRODUCTION-GUIDE.md](PRODUCTION-GUIDE.md) for comprehensive deployment instructions including:
- Email service configuration
- Environment variables
- Security best practices
- Deployment options (Same server, Vercel + Railway, Docker)
- Database migration to PostgreSQL
- PM2 process management
- SSL/HTTPS setup
- Monitoring and logging

## 🔒 Security Features
- JWT token authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- Admin role-based access control
- Email verification
- Protected API endpoints
- CORS configuration

## 🎯 Future Enhancements
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Product reviews system (database ready)
- [ ] Wishlist functionality
- [ ] Advanced product search and filters
- [ ] Product image uploads
- [ ] Multi-language support
- [ ] Order invoices (PDF generation)
- [ ] Shipping tracking integration
- [ ] Product recommendations
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### "Admin access required" error
- Logout and login again after setting admin status
- Clear browser localStorage
- Verify `is_admin = 1` in database

### Email not sending
- Check `.env` configuration
- For Gmail, use App Password (not regular password)
- Check console logs for email errors
- Emails will log to console if not configured

### Database errors
```bash
# Check database status
cd server
node check-db.js

# Reset database (WARNING: Deletes all data)
rm ecommerce.db
npm start  # Will recreate tables
```

### Port already in use
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <process-id> /F
```

## 📄 License
This project is for educational and portfolio purposes.

## 👨‍💻 Developer
Developed as a full-stack e-commerce solution showcasing modern web development practices.

## 🆘 Support
For deployment help or feature requests, refer to the documentation or check the troubleshooting section.

---

**Happy Coding! 🎉**
