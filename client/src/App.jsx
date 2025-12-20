import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Toast />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:orderId" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
