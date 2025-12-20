// API Configuration
const API_URL = 'http://localhost:3000/api';

// Load cart from localStorage
cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count
function updateCartCount() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Display checkout items
function displayCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    checkoutItems.innerHTML = '';

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity} × $${parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div class="checkout-item-price">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        checkoutItems.appendChild(itemDiv);
    });

    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
}

// Handle form submission
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postalCode').value;
        const country = document.getElementById('country').value;
        const notes = document.getElementById('notes').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Prepare order data
        const orderData = {
            customer_name: fullName,
            customer_email: email,
            customer_phone: phone,
            customer_address: `${address}, ${city}, ${postalCode}, ${country}`,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        // Disable submit button
        const submitBtn = document.getElementById('placeOrderBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Send order to backend
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Clear cart
                localStorage.removeItem('cart');

                // Show success message
                alert(`✅ Order Placed Successfully!\n\nOrder ID: #${result.order_id}\nTotal: $${result.total.toFixed(2)}\n\nWe'll contact you at ${email} with delivery details.\n\nThank you for shopping with ShopHub!`);

                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                throw new Error(result.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('❌ Error placing order. Please try again or contact support.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });
}

// Initialize checkout page
if (window.location.pathname.includes('checkout.html')) {
    updateCartCount();
    displayCheckoutItems();
}
