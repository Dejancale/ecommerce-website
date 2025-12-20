const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db');

console.log('\n🔧 Making all existing users admin...\n');

db.run('UPDATE users SET is_admin = 1', function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log(`✅ Success! Updated ${this.changes} user(s) to admin status.`);
    console.log('\nYou can now access the admin panel at: http://localhost:5173/admin');
    console.log('\n📝 Note: Please logout and login again for changes to take effect.\n');
  }
  db.close();
});
