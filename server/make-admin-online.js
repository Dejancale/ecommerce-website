// Make user admin on Render
const email = 'admin@test.com';
const BACKEND_URL = 'https://ecommerce-website-ueki.onrender.com';

// First, register if not exists
fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: email,
        password: 'Admin123',
        firstName: 'Admin',
        lastName: 'User'
    })
})
.then(res => res.json())
.then(data => {
    console.log('User created/exists:', data);
    
    // Now try to update via SQL (won't work through API but shows the email)
    console.log('\n⚠️  To make this user admin, you need to:');
    console.log('1. Login to Render dashboard');
    console.log('2. Go to your backend service');
    console.log('3. Open Shell tab');
    console.log('4. Run: sqlite3 ecommerce.db "UPDATE users SET is_admin=1 WHERE email=\'admin@test.com\'"');
    console.log('\nOR use the website and I\'ll create an admin panel endpoint.');
})
.catch(err => console.log('User might already exist:', err.message));
