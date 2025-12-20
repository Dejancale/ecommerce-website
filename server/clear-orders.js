const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db');

console.log('\n🗑️  Clearing all orders from database...\n');

// Delete order items first (foreign key constraint)
db.run('DELETE FROM order_items', function(err) {
  if (err) {
    console.error('❌ Error deleting order items:', err.message);
    db.close();
    return;
  }
  
  console.log(`✅ Deleted ${this.changes} order items`);
  
  // Then delete orders
  db.run('DELETE FROM orders', function(err) {
    if (err) {
      console.error('❌ Error deleting orders:', err.message);
      db.close();
      return;
    }
    
    console.log(`✅ Deleted ${this.changes} orders`);
    console.log('\n✨ All orders have been cleared from the database.\n');
    
    db.close();
  });
});
