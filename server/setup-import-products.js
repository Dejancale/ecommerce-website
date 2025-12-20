// Run this once to import your products into the database
const fs = require('fs');

// Read products.json
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Send to backend API
fetch('http://localhost:3000/api/admin/import-products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(productsData)
})
.then(response => response.json())
.then(data => {
    console.log('✓ Products imported successfully!');
    console.log(data);
})
.catch(error => {
    console.error('Error:', error);
});
