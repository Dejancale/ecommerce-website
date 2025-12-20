const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db');

console.log('\n📋 Checking Users:\n');

db.all('SELECT id, email, first_name, last_name, is_admin FROM users', [], (err, users) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  users.forEach(user => {
    const adminStatus = user.is_admin ? '✅ ADMIN' : '❌ Not Admin';
    console.log(`${user.id}. ${user.first_name} ${user.last_name} (${user.email}) - ${adminStatus}`);
  });
  
  console.log('\n📦 Checking Orders:\n');
  
  db.all('SELECT o.*, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id', [], (err, orders) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    
    if (orders.length === 0) {
      console.log('No orders found.');
    } else {
      orders.forEach(order => {
        console.log(`Order #${order.id}:`);
        console.log(`  Customer: ${order.customer_name}`);
        console.log(`  Email: ${order.customer_email}`);
        console.log(`  User Account: ${order.user_email || 'Guest'}`);
        console.log(`  Total: $${order.total_amount}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Date: ${order.created_at}`);
        console.log('');
      });
    }
    
    db.close();
  });
});
