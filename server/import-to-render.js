// Script to import products to Render deployment
const fs = require('fs');

// Your Render backend URL
const BACKEND_URL = 'https://ecommerce-website-ueki.onrender.com';

// Read products.json
const productsData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

console.log(`Importing ${productsData.products.length} products to ${BACKEND_URL}...`);

fetch(`${BACKEND_URL}/api/admin/import-products`, {
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
    console.error('❌ Error:', error);
});
