# Admin Panel Setup & Usage Guide

## 🎉 What's New

Your e-commerce site now has a **complete admin panel** with:

### ✅ Features Implemented:
1. **Admin Dashboard** - View stats: total orders, revenue, pending orders, products, users
2. **Order Management** - View all orders, filter by status, search, update order status
3. **Product Management** - Add, edit, delete products with stock tracking
4. **Order Status System** - Track orders: pending → processing → shipped → delivered
5. **Stock Management** - Track inventory for each product
6. **Admin Role System** - Secure admin-only access

---

## 🚀 Getting Started

### Step 1: Make Your Account Admin

1. **Register/Login** to your account on the website (if you haven't already)
2. **Stop the backend server** (Ctrl+C in server terminal)
3. **Run the make-admin script**:
   ```powershell
   cd server
   node make-admin.js
   ```
4. **Select your user ID** from the list
5. **Restart the backend server**:
   ```powershell
   npm start
   ```
6. **Refresh your browser** and you'll see the **⚙️ Admin** link in the navbar

### Step 2: Access Admin Panel

- Navigate to **http://localhost:5173/admin**
- Or click the **⚙️ Admin** button in the navbar

---

## 📊 Admin Features

### 1. **Dashboard** (`/admin`)
- **Stats Cards**: Total Revenue, Total Orders, Pending Orders, Total Products, Total Users
- **Recent Orders Table**: View last 10 orders with quick access
- **Quick Actions**: Navigate to Orders or Products management

### 2. **Manage Orders** (`/admin/orders`)
- **View All Orders**: Complete list with customer info, totals, status
- **Search**: Filter by customer name, email, or order ID
- **Status Filter**: View only pending, processing, shipped, delivered, or cancelled orders
- **Order Details**: Click "View" to see:
  - Customer information (name, email, phone, address)
  - Order items with quantities and prices
  - Payment method
  - Order date
  - **Update Status**: Change order status with one click

#### Order Status Flow:
1. **Pending** - New order placed
2. **Processing** - Order being prepared
3. **Shipped** - Order sent to customer
4. **Delivered** - Order received by customer
5. **Cancelled** - Order cancelled

### 3. **Manage Products** (`/admin/products`)
- **View All Products**: Grid layout with images, prices, stock info
- **Add Product**: Click "+ Add New Product"
  - Product name, category, price
  - Optional: old price (for sale display)
  - Stock count (auto-updates inStock status)
  - Image URL
  - Description
  - Badge (Hot, New, Sale)
- **Edit Product**: Click "✏️ Edit" to update any field
- **Delete Product**: Click "🗑️ Delete" (confirms before deleting)

---

## 🛠️ Technical Details

### Database Changes:
- ✅ Added `is_admin` column to `users` table
- ✅ Added `status` field to `orders` table (already existed)
- ✅ Products table already has `stockCount` and `inStock` fields

### Backend API Endpoints:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders with user info
- `GET /api/admin/orders/:id` - Order details with items
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - All users list
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

All admin endpoints require:
- Valid JWT token in Authorization header
- User must have `is_admin = 1`

### Frontend Components:
- `AdminDashboard.jsx` - Main admin page with stats
- `AdminOrders.jsx` - Orders list and details view
- `AdminProducts.jsx` - Product management with modal
- `AdminDashboard.css` - Purple/pink themed styling
- Protected routes (redirect to home if not admin)

---

## 💡 Tips for Managing Your Store

### Daily Workflow:
1. **Check Dashboard** for new orders and pending count
2. **Process Orders**:
   - View order details
   - Mark as "Processing" when preparing
   - Mark as "Shipped" when sent (add tracking number in future version)
   - Mark as "Delivered" when confirmed
3. **Manage Inventory**:
   - Check stock levels
   - Update quantities when restocking
   - Set products out of stock when needed

### Best Practices:
- ✅ Update order status promptly (customers love tracking)
- ✅ Keep product descriptions clear and detailed
- ✅ Use badges (Hot, New, Sale) to highlight products
- ✅ Monitor stock levels to avoid overselling
- ✅ Regular price updates for sales and promotions

---

## 🔮 Future Enhancements (Not Yet Implemented)

**Nice to have:**
- Email notifications when order status changes
- Bulk order status updates
- Order filtering by date range
- Export orders to CSV
- Upload product images (currently URL only)
- Customer management page
- Analytics charts and graphs
- Admin activity logs
- Multiple admin users
- Password reset for customers

---

## 🐛 Troubleshooting

**Can't see Admin link?**
- Make sure you ran `make-admin.js` script
- Check that your account's `is_admin = 1` in database
- Try logging out and back in
- Hard refresh browser (Ctrl+Shift+R)

**Admin pages redirect to home?**
- Your account must have admin privileges
- Check browser console for errors
- Ensure backend server is running

**Product images not showing?**
- Currently using URL-based images
- Make sure image URLs are valid and accessible
- Test URL in browser first

---

## 📝 Quick Commands

```powershell
# Make user admin
cd server
node make-admin.js

# Start backend
cd server
npm start

# Start frontend
cd client
npm run dev
```

---

**Congrats!** 🎉 You now have a functional admin system to manage your e-commerce store!
