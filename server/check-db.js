const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db');

console.log('\n📊 Database Statistics:\n');

db.get('SELECT COUNT(*) as total FROM orders', [], (err, result) => {
  if (err) {
    console.error('Error:', err.message);
    db.close();
    return;
  }
  
  console.log(`Orders: ${result.total}`);
  
  db.get('SELECT COUNT(*) as total FROM order_items', [], (err, result) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log(`Order Items: ${result.total}`);
    }
    
    db.get('SELECT COUNT(*) as total FROM products', [], (err, result) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log(`Products: ${result.total}`);
      }
      
      db.get('SELECT COUNT(*) as total FROM users', [], (err, result) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          console.log(`Users: ${result.total}`);
        }
        console.log('');
        db.close();
      });
    });
  });
});
