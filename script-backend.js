// API Configuration
const API_URL = 'http://localhost:3000/api';

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
const cartCountElement = document.querySelector('.cart-count');

// Make cart icon clickable
const cartIcon = document.querySelector('.cart-icon');
if (cartIcon && !cartIcon.href) {
    cartIcon.style.cursor = 'pointer';
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'cart.html';
    });
}

// Update cart count
function updateCartCount() {
    cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}
updateCartCount();

// Load products from backend
let allProducts = [];

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        allProducts = data.products;
        return allProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Unable to connect to server. Make sure the backend is running on port 3000.');
        return [];
    }
}

// Display products
function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    if (products.length === 0) {
        productsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });

    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = products.length;
    }

    attachProductEventListeners();
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    card.dataset.price = product.price;
    card.dataset.stock = product.inStock;

    const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);

    let badgeHTML = '';
    if (product.badge) {
        const badgeClass = product.badge.toLowerCase() === 'sale' ? 'badge sale' : 'badge';
        badgeHTML = `<span class="${badgeClass}">${product.badge}</span>`;
    }

    const stockBadgeClass = product.inStock ? 'stock-badge in-stock' : 'stock-badge out-stock';
    let stockText = product.inStock ? 'In Stock' : 'Out of Stock';
    if (product.inStock && product.stockCount <= 5) {
        stockText = `Only ${product.stockCount} Left!`;
    }

    let priceHTML = `<p class="price">$${parseFloat(product.price).toFixed(2)}</p>`;
    if (product.oldPrice) {
        priceHTML = `<p class="price"><span class="old-price">$${parseFloat(product.oldPrice).toFixed(2)}</span> $${parseFloat(product.price).toFixed(2)}</p>`;
    }

    const buttonDisabled = !product.inStock ? 'disabled' : '';
    const buttonText = product.inStock ? 'Add to Cart' : 'Out of Stock';

    card.innerHTML = `
        <div class="product-image">
            ${badgeHTML}
            <img src="${product.image}" alt="${product.name}">
            <div class="product-overlay">
                <button class="btn-quick-view" data-id="${product.id}">Quick View</button>
            </div>
            <span class="${stockBadgeClass}">${stockText}</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="rating">${stars} (${product.reviews_count || 0})</div>
            ${priceHTML}
            <button class="btn btn-add-cart" data-id="${product.id}" ${buttonDisabled}>${buttonText}</button>
        </div>
    `;

    return card;
}

// Attach event listeners
function attachProductEventListeners() {
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!button.disabled) {
                const productId = parseInt(button.dataset.id);
                addToCart(productId);

                button.textContent = 'Added!';
                button.style.backgroundColor = '#45B369';

                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.style.backgroundColor = '';
                }, 1500);
            }
        });
    });

    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    quickViewButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.id);
            await showProductModal(productId);
        });
    });
}

// Add to cart function
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Show product modal
async function showProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    try {
        const response = await fetch(`${API_URL}/products/${productId}/reviews`);
        const data = await response.json();
        const reviews = data.reviews || [];

        let reviewsHTML = reviews.length > 0 
            ? reviews.map(r => `${r.customer_name} - ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}: ${r.comment || ''}`).join('\n')
            : 'No reviews yet';

        alert(`${product.name}\n\n${product.description}\n\nPrice: $${product.price}\nStock: ${product.stockCount} available\n\nREVIEWS (${reviews.length}):\n${reviewsHTML}`);

    } catch (error) {
        alert(`${product.name}\n\n${product.description}\n\nPrice: $${product.price}`);
    }
}

// Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        alert(`Thank you ${name}! Your message has been sent.`);
        contactForm.reset();
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        }
    });
});

// Products Page
if (window.location.pathname.includes('products.html') || document.getElementById('productsContainer')) {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categoryFilters = document.querySelectorAll('.category-filter');
    const priceFilters = document.querySelectorAll('.price-filter');
    const inStockOnly = document.getElementById('inStockOnly');
    const clearFiltersBtn = document.getElementById('clearFilters');

    loadProducts().then((products) => {
        if (products.length === 0) return;
        displayProducts(products);

        function filterAndSortProducts() {
            let filteredProducts = [...allProducts];

            if (searchInput) {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm)
                    );
                }
            }

            if (categoryFilters.length > 0) {
                const selectedCategories = Array.from(categoryFilters)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);

                if (selectedCategories.length > 0) {
                    filteredProducts = filteredProducts.filter(product =>
                        selectedCategories.includes(product.category)
                    );
                }
            }

            if (priceFilters.length > 0) {
                const selectedPriceFilter = document.querySelector('.price-filter:checked');
                if (selectedPriceFilter) {
                    const selectedPrice = selectedPriceFilter.value;
                    if (selectedPrice !== 'all') {
                        filteredProducts = filteredProducts.filter(product => {
                            const price = parseFloat(product.price);
                            if (selectedPrice === '0-50') return price < 50;
                            if (selectedPrice === '50-100') return price >= 50 && price < 100;
                            if (selectedPrice === '100-200') return price >= 100 && price < 200;
                            if (selectedPrice === '200+') return price >= 200;
                            return true;
                        });
                    }
                }
            }

            if (inStockOnly && inStockOnly.checked) {
                filteredProducts = filteredProducts.filter(product => product.inStock === 1);
            }

            if (sortSelect) {
                const sortValue = sortSelect.value;
                filteredProducts.sort((a, b) => {
                    switch(sortValue) {
                        case 'price-low': return a.price - b.price;
                        case 'price-high': return b.price - a.price;
                        case 'newest': return b.id - a.id;
                        case 'popular': return b.reviews_count - a.reviews_count;
                        default: return a.id - b.id;
                    }
                });
            }

            displayProducts(filteredProducts);
        }

        if (searchInput) searchInput.addEventListener('input', filterAndSortProducts);
        if (sortSelect) sortSelect.addEventListener('change', filterAndSortProducts);
        categoryFilters.forEach(f => f.addEventListener('change', filterAndSortProducts));
        priceFilters.forEach(f => f.addEventListener('change', filterAndSortProducts));
        if (inStockOnly) inStockOnly.addEventListener('change', filterAndSortProducts);

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                categoryFilters.forEach(cb => cb.checked = false);
                const allPriceFilter = document.querySelector('.price-filter[value="all"]');
                if (allPriceFilter) allPriceFilter.checked = true;
                if (inStockOnly) inStockOnly.checked = false;
                if (sortSelect) sortSelect.value = 'featured';
                filterAndSortProducts();
            });
        }
    });
}

// Featured products on homepage
const isFeaturedPage = document.querySelector('.featured-products .products-grid');
if (isFeaturedPage && !window.location.pathname.includes('products.html')) {
    loadProducts().then((products) => {
        if (products.length === 0) return;

        const featuredContainer = document.querySelector('.featured-products .products-grid');
        if (featuredContainer) {
            const featuredProducts = products.filter(p => p.badge).slice(0, 4);

            if (featuredProducts.length < 4) {
                const remaining = 4 - featuredProducts.length;
                featuredProducts.push(...products.filter(p => !p.badge).slice(0, remaining));
            }

            featuredContainer.innerHTML = '';
            featuredProducts.forEach(product => {
                featuredContainer.appendChild(createProductCard(product));
            });

            attachProductEventListeners();
        }
    });
}

console.log('ShopHub connected to backend API!');
console.log('Backend URL:', API_URL);
