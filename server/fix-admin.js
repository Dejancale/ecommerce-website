const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db');

console.log('\n🔧 Fixing admin permissions...\n');

// First, remove admin from all users
db.run('UPDATE users SET is_admin = 0', function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  
  console.log(`✅ Removed admin from all users`);
  
  // Then, make only deko_skopje@yahoo.com admin
  db.run('UPDATE users SET is_admin = 1 WHERE email = ?', ['deko_skopje@yahoo.com'], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
    } else if (this.changes === 0) {
      console.log('❌ User with email deko_skopje@yahoo.com not found');
    } else {
      console.log(`✅ Made deko_skopje@yahoo.com admin`);
      console.log('\n✨ Done! Only your account is now admin.\n');
      console.log('📝 Please logout and login again on all accounts.\n');
    }
    db.close();
  });
});
