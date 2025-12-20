const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const db = new sqlite3.Database('./ecommerce.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Make User Admin ===\n');

// Get all users
db.all('SELECT id, email, first_name, last_name, is_admin FROM users', [], (err, users) => {
  if (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('No users found in database.');
    process.exit(0);
  }

  console.log('Available users:\n');
  users.forEach(user => {
    const adminStatus = user.is_admin ? '✅ ADMIN' : '❌ Not admin';
    console.log(`${user.id}. ${user.first_name} ${user.last_name} (${user.email}) - ${adminStatus}`);
  });

  rl.question('\nEnter user ID to make admin (or 0 to cancel): ', (answer) => {
    const userId = parseInt(answer);

    if (userId === 0) {
      console.log('Cancelled.');
      rl.close();
      db.close();
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log('Invalid user ID.');
      rl.close();
      db.close();
      return;
    }

    if (user.is_admin) {
      console.log(`\n${user.first_name} ${user.last_name} is already an admin.`);
      rl.close();
      db.close();
      return;
    }

    // Make user admin
    db.run('UPDATE users SET is_admin = 1 WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error updating user:', err);
      } else {
        console.log(`\n✅ Success! ${user.first_name} ${user.last_name} is now an admin.`);
        console.log(`\nThey can now access the admin panel at: http://localhost:5173/admin`);
      }
      rl.close();
      db.close();
    });
  });
});
