// Password Visibility Toggle
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toast Notification Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Force reflow to trigger slide-in animation
    toast.offsetHeight;
    toast.classList.add('show');

    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 4000);
}

// Handle Register Form Submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, address, password })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'Registration successful!', 'success');
                // Optional: Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login-page';
                }, 1500);
            } else {
                // Handle backend validation errors or custom errors
                const errorMsg = data.detail || 'Registration failed. Please try again.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            showToast('Network error. Please check your connection.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// Handle Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        const email = document.getElementById('login_email').value.trim();
        const password = document.getElementById('login_password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userName', data.name || 'User');
                localStorage.setItem('userEmail', data.email || '');
                localStorage.setItem('userPhone', data.phone || '');
                localStorage.setItem('userAddress', data.address || '');
                
                showToast(`Welcome back, ${data.name || 'User'}! Login successful.`, 'success');
                setTimeout(() => {
                    window.location.href = '/products-page';
                }, 1500);
            } else {
                const errorMsg = data.detail || 'Invalid credentials. Please try again.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showToast('Network error. Please check your connection.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// Logout Helper
function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAddress');
    showToast('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
}

// ==========================================
// PRODUCT UPLOAD & MANAGEMENT
// ==========================================

// Drag and Drop Upload Handlers
const uploadDropzone = document.getElementById('uploadDropzone');
const fileInput = document.getElementById('product_image');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const btnRemovePreview = document.getElementById('btnRemovePreview');

if (uploadDropzone && fileInput) {
    // Click to select file
    uploadDropzone.addEventListener('click', (e) => {
        if (e.target !== btnRemovePreview && !btnRemovePreview.contains(e.target)) {
            fileInput.click();
        }
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadDropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadDropzone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped file
    uploadDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleImagePreview(files[0]);
        }
    });

    // Handle file selection via browse
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleImagePreview(fileInput.files[0]);
        }
    });

    // Remove preview
    btnRemovePreview.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewImg.src = '';
        uploadPreview.classList.remove('active');
    });
}

function handleImagePreview(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadPreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    } else {
        showToast('Please select a valid image file.', 'error');
    }
}

// Handle Add Product Form Submission
const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        const name = document.getElementById('product_name').value.trim();
        const price = document.getElementById('product_price').value;
        const quantity = document.getElementById('product_qty').value;
        const description = document.getElementById('product_desc').value.trim();
        const imageFile = fileInput.files[0];

        if (!imageFile) {
            showToast('Please upload a product image.', 'error');
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('description', description);
        formData.append('image', imageFile);

        try {
            const response = await fetch('/products/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Product added successfully!', 'success');
                // Reset form & preview
                productForm.reset();
                if (btnRemovePreview) btnRemovePreview.click();
                
                // Redirect to products list after a short delay
                setTimeout(() => {
                    window.location.href = '/products-page';
                }, 1500);
            } else {
                const errorMsg = data.detail || 'Failed to add product. Please try again.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Add Product Error:', error);
            showToast('Network error occurred while adding product.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// PRODUCTS LIST / GALLERY
// ==========================================
let allProducts = [];

// Fetch all products from API
async function fetchProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    try {
        const response = await fetch('/products/get/');
        if (response.ok) {
            allProducts = await response.json();
            renderProducts(allProducts);
        } else {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-circle-exclamation empty-icon" style="color: var(--error-color);"></i>
                    <h3 class="empty-title">Error Loading Products</h3>
                    <p class="empty-desc">Could not retrieve products from the database.</p>
                </div>
            `;
            showToast('Failed to fetch products.', 'error');
        }
    } catch (error) {
        console.error('Fetch Products Error:', error);
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-wifi-slash empty-icon" style="color: var(--error-color);"></i>
                <h3 class="empty-title">Connection Error</h3>
                <p class="empty-desc">Please check your backend server connection.</p>
            </div>
        `;
    }
}

// Render products dynamically
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-boxes-open empty-icon"></i>
                <h3 class="empty-title">No Products Found</h3>
                <p class="empty-desc">We couldn't find any products matching your search or database is empty.</p>
                <a href="/add-product-page" class="btn-primary" style="display: inline-flex; width: auto; padding: 12px 24px; margin-top: 15px; text-decoration: none; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-plus"></i> Add First Product
                </a>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = '';

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.08}s`;

        const isOutOfStock = product.quantity <= 0;
        const badgeClass = isOutOfStock ? 'badge-out-of-stock' : 'badge-in-stock';
        const badgeText = isOutOfStock ? 'Out of Stock' : `In Stock (${product.quantity})`;
        
        // Ensure image URL is formatted correctly (convert backslashes to forward slashes for Windows compatibility)
        const imageUrl = product.image ? '/' + product.image.replace(/\\/g, '/') : '/static/placeholder.png';

        card.innerHTML = `
            <div class="product-image-wrapper" onclick="openProductModal(${product.id})" style="cursor: pointer;">
                <img src="${imageUrl}" alt="${escapeHtml(product.name)}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80'">
                <span class="product-qty-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name" onclick="openProductModal(${product.id})" style="cursor: pointer; transition: color 0.2s;">${escapeHtml(product.name)}</h3>
                <p class="product-desc">${escapeHtml(product.description)}</p>
                <div class="product-footer">
                    <div>
                        <div class="product-price-label">Price</div>
                        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    </div>
                    <button class="product-action-btn" title="${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}" onclick="quickAddToCart(event, ${product.id})" ${isOutOfStock ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Search bar filtering
const searchBar = document.getElementById('searchBar');
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });
}

// ==========================================
// CENTRAL NAVIGATION & THEME INITIALIZER
// ==========================================
function initializeNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const currentPath = window.location.pathname;
    const userName = localStorage.getItem('userName');
    
    if (userName) {
        navLinks.innerHTML = `
            <li><a href="/" class="nav-link ${currentPath === '/' ? 'active' : ''}">Home</a></li>
            <li><a href="/products-page" class="nav-link ${currentPath === '/products-page' ? 'active' : ''}">Products</a></li>
            <li><a href="/add-product-page" class="nav-link ${currentPath === '/add-product-page' ? 'active' : ''}">Add Product</a></li>
            <li><a href="/cart-page" class="nav-link ${currentPath === '/cart-page' ? 'active' : ''}"><i class="fa-solid fa-cart-shopping"></i> Cart <span id="cartBadge" class="nav-badge" style="display:none;">0</span></a></li>
            <li><a href="/orders-page" class="nav-link ${currentPath === '/orders-page' ? 'active' : ''}">My Orders</a></li>
            <li><span class="nav-link" style="color: #a5b4fc; font-weight:600;"><i class="fa-solid fa-user"></i> ${userName}</span></li>
            <li><button onclick="logout()" class="btn-nav-action btn-logout">Logout</button></li>
        `;
        updateCartBadge();
    } else {
        navLinks.innerHTML = `
            <li><a href="/" class="nav-link ${currentPath === '/' ? 'active' : ''}">Home</a></li>
            <li><a href="/products-page" class="nav-link ${currentPath === '/products-page' ? 'active' : ''}">Products</a></li>
            <li><a href="/login-page" class="btn-nav-action btn-nav-login">Sign In</a></li>
            <li><a href="/register-page" class="btn-nav-action btn-nav-register">Register</a></li>
        `;
    }
}

// Update Cart Badge Count
async function updateCartBadge() {
    const userId = localStorage.getItem('userId');
    const badge = document.getElementById('cartBadge');
    if (!userId || !badge) return;

    try {
        const response = await fetch(`/cart/${userId}`);
        if (response.ok) {
            const items = await response.json();
            const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
            
            if (totalItems > 0) {
                badge.innerText = totalItems;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update cart badge:', error);
    }
}

// ==========================================
// CART OPERATIONS
// ==========================================

// Quick add (quantity = 1) from card list
function quickAddToCart(event, productId) {
    if (event) {
        event.stopPropagation(); // prevent modal opening
    }
    addToCart(productId, 1);
}

// Central add method
async function addToCart(productId, quantity) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showToast('Please sign in to add items to your cart!', 'error');
        setTimeout(() => {
            window.location.href = '/login-page';
        }, 1500);
        return;
    }

    try {
        const response = await fetch(`/cart/add?user_id=${userId}&product_id=${productId}&quantity=${quantity}`, {
            method: 'POST'
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Added to cart successfully!', 'success');
            updateCartBadge();
            
            // If on cart page, reload cart list
            if (window.location.pathname === '/cart-page') {
                fetchCartItems();
            }
        } else {
            showToast(data.detail || 'Failed to add item.', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Connection error. Please try again.', 'error');
    }
}

// Central update quantity method
async function updateCartQuantity(productId, newQty) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`/cart/update?user_id=${userId}&product_id=${productId}&quantity=${newQty}`, {
            method: 'POST'
        });

        if (response.ok) {
            updateCartBadge();
            fetchCartItems(); // reload lists
        } else {
            const data = await response.json();
            showToast(data.detail || 'Failed to update quantity.', 'error');
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
    }
}

// Central remove method
async function removeFromCart(productId) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`/cart/remove?user_id=${userId}&product_id=${productId}`, {
            method: 'POST'
        });

        if (response.ok) {
            showToast('Item removed from cart.', 'success');
            updateCartBadge();
            fetchCartItems();
        } else {
            showToast('Failed to remove item.', 'error');
        }
    } catch (error) {
        console.error('Error removing item:', error);
    }
}

// Central clear method
async function clearCart() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`/cart/clear?user_id=${userId}`, {
            method: 'POST'
        });

        if (response.ok) {
            showToast('Cart cleared.', 'success');
            updateCartBadge();
            fetchCartItems();
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// ==========================================
// PRODUCT DETAIL MODAL FUNCTIONALITY
// ==========================================
let activeModalProduct = null;

function getModalBackdrop() {
    let backdrop = document.getElementById('productModalBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'productModalBackdrop';
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="product-modal" id="productModal">
                <button type="button" class="modal-close-btn" onclick="closeProductModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="modal-image-wrapper">
                    <img id="modalProductImg" src="" alt="" class="modal-image">
                </div>
                <div class="modal-info-panel">
                    <h2 id="modalProductName" class="modal-product-name"></h2>
                    <div id="modalProductPrice" class="modal-product-price"></div>
                    <p id="modalProductDesc" class="modal-product-desc"></p>
                    <div class="modal-qty-container">
                        <span style="font-weight: 600; font-size: 0.95rem;">Quantity:</span>
                        <div class="qty-control">
                            <button type="button" class="qty-btn" onclick="adjustModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
                            <input type="number" id="modalQtyInput" class="qty-input" value="1" min="1">
                            <button type="button" class="qty-btn" onclick="adjustModalQty(1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <span id="modalStockLabel" style="font-size: 0.85rem; color: var(--text-muted);"></span>
                    </div>
                    <button type="button" class="btn-primary" id="modalAddBtn" onclick="addActiveProductToCart()">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        
        // Prevent click events inside modal from closing it
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeProductModal();
            }
        });
    }
    return backdrop;
}

async function openProductModal(productId) {
    try {
        const response = await fetch(`/products/${productId}`);
        if (response.ok) {
            activeModalProduct = await response.json();
            const backdrop = getModalBackdrop();

            // Populate fields
            const imageUrl = activeModalProduct.image ? '/' + activeModalProduct.image.replace(/\\/g, '/') : '/static/placeholder.png';
            document.getElementById('modalProductImg').src = imageUrl;
            document.getElementById('modalProductName').innerText = activeModalProduct.name;
            document.getElementById('modalProductPrice').innerText = `$${parseFloat(activeModalProduct.price).toFixed(2)}`;
            document.getElementById('modalProductDesc').innerText = activeModalProduct.description;
            document.getElementById('modalQtyInput').value = 1;
            
            const isOutOfStock = activeModalProduct.quantity <= 0;
            const stockLabel = document.getElementById('modalStockLabel');
            const addBtn = document.getElementById('modalAddBtn');

            if (isOutOfStock) {
                stockLabel.innerText = "Out of Stock";
                stockLabel.style.color = "var(--error-color)";
                addBtn.disabled = true;
                addBtn.style.opacity = 0.5;
                addBtn.style.cursor = "not-allowed";
                addBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Out of Stock`;
            } else {
                stockLabel.innerText = `In Stock (${activeModalProduct.quantity})`;
                stockLabel.style.color = "var(--success-color)";
                addBtn.disabled = false;
                addBtn.style.opacity = 1;
                addBtn.style.cursor = "pointer";
                addBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Add to Cart`;
            }

            backdrop.classList.add('active');
        } else {
            showToast('Failed to retrieve product details.', 'error');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        showToast('Connection error occurred.', 'error');
    }
}

function closeProductModal() {
    const backdrop = document.getElementById('productModalBackdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
    }
    activeModalProduct = null;
}

function adjustModalQty(delta) {
    const qtyInput = document.getElementById('modalQtyInput');
    if (!qtyInput || !activeModalProduct) return;
    
    let val = parseInt(qtyInput.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > activeModalProduct.quantity) {
        val = activeModalProduct.quantity;
        showToast(`Only ${activeModalProduct.quantity} items available in stock.`, 'warning');
    }
    qtyInput.value = val;
}

function addActiveProductToCart() {
    if (!activeModalProduct) return;
    const qtyInput = document.getElementById('modalQtyInput');
    const qty = parseInt(qtyInput.value) || 1;
    addToCart(activeModalProduct.id, qty);
    closeProductModal();
}

// ==========================================
// CART PAGE RENDERING
// ==========================================
async function fetchCartItems() {
    const userId = localStorage.getItem('userId');
    const cartGrid = document.getElementById('cartGrid');
    if (!cartGrid) return; // not on cart page

    if (!userId) {
        window.location.href = '/login-page';
        return;
    }

    try {
        const response = await fetch(`/cart/${userId}`);
        if (response.ok) {
            const items = await response.json();
            renderCartPage(items);
        } else {
            cartGrid.innerHTML = `<p style="color:var(--error-color);">Failed to retrieve cart items.</p>`;
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function renderCartPage(items) {
    const cartGrid = document.getElementById('cartGrid');
    const subtotalDisplay = document.getElementById('cartSubtotal');
    const shippingDisplay = document.getElementById('cartShipping');
    const totalDisplay = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');

    if (!cartGrid) return;

    if (items.length === 0) {
        cartGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cart-shopping empty-icon"></i>
                <h3 class="empty-title">Your Cart is Empty</h3>
                <p class="empty-desc">Looks like you haven't added anything to your cart yet.</p>
                <a href="/products-page" class="btn-primary" style="display:inline-flex; width:auto; padding:12px 24px; text-decoration:none;">
                    Continue Shopping
                </a>
            </div>
        `;
        if (subtotalDisplay) subtotalDisplay.innerText = '$0.00';
        if (shippingDisplay) shippingDisplay.innerText = '$0.00';
        if (totalDisplay) totalDisplay.innerText = '$0.00';
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = 0.5;
            checkoutBtn.style.cursor = 'not-allowed';
        }
        return;
    }

    cartGrid.innerHTML = '';
    let subtotal = 0;

    items.forEach(item => {
        subtotal += item.price * item.quantity;
        const imageUrl = item.image ? '/' + item.image.replace(/\\/g, '/') : '/static/placeholder.png';
        
        const row = document.createElement('div');
        row.className = 'cart-card-item';
        row.innerHTML = `
            <img src="${imageUrl}" alt="${escapeHtml(item.name)}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80'">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
            </div>
            
            <div class="qty-control">
                <button type="button" class="qty-btn" onclick="updateCartQuantity(${item.product_id}, ${item.quantity - 1})"><i class="fa-solid fa-minus"></i></button>
                <input type="number" class="qty-input" value="${item.quantity}" readonly>
                <button type="button" class="qty-btn" onclick="updateCartQuantity(${item.product_id}, ${item.quantity + 1})"><i class="fa-solid fa-plus"></i></button>
            </div>
            
            <div style="font-weight: 700; width: 80px; text-align: right; color: white;">
                $${parseFloat(item.price * item.quantity).toFixed(2)}
            </div>
            
            <button class="cart-item-remove-btn" onclick="removeFromCart(${item.product_id})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        cartGrid.appendChild(row);
    });

    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
    const total = subtotal + shipping;

    if (subtotalDisplay) subtotalDisplay.innerText = `$${subtotal.toFixed(2)}`;
    if (shippingDisplay) shippingDisplay.innerText = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalDisplay) totalDisplay.innerText = `$${total.toFixed(2)}`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = 1;
        checkoutBtn.style.cursor = 'pointer';
        checkoutBtn.onclick = () => { window.location.href = '/checkout-page'; };
    }
}

// ==========================================
// CHECKOUT & CREDIT CARD HANDLERS
// ==========================================
async function fetchCartForCheckout() {
    const userId = localStorage.getItem('userId');
    const orderItemsGrid = document.getElementById('orderItemsSummary');
    const orderTotalDisplay = document.getElementById('orderSummaryTotal');
    
    if (!orderItemsGrid || !userId) return;

    try {
        const response = await fetch(`/cart/${userId}`);
        if (response.ok) {
            const items = await response.json();
            
            if (items.length === 0) {
                showToast('Your cart is empty. Redirecting back to products page...', 'warning');
                setTimeout(() => { window.location.href = '/products-page'; }, 2000);
                return;
            }

            orderItemsGrid.innerHTML = '';
            let subtotal = 0;

            items.forEach(item => {
                subtotal += item.price * item.quantity;
                const row = document.createElement('div');
                row.className = 'summary-row';
                row.style.marginBottom = '10px';
                row.innerHTML = `
                    <span>${escapeHtml(item.name)} (x${item.quantity})</span>
                    <span style="color: white; font-weight: 600;">$${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                `;
                orderItemsGrid.appendChild(row);
            });

            const shipping = subtotal > 100 ? 0 : 9.99;
            const total = subtotal + shipping;
            
            if (orderTotalDisplay) {
                orderTotalDisplay.innerText = `$${total.toFixed(2)}`;
            }

            // Autofill user shipping inputs from registration cache
            const cacheName = localStorage.getItem('userName');
            const cacheEmail = localStorage.getItem('userEmail');
            const cachePhone = localStorage.getItem('userPhone');
            const cacheAddress = localStorage.getItem('userAddress');

            const nameInput = document.getElementById('shipping_name');
            const emailInput = document.getElementById('shipping_email');
            const phoneInput = document.getElementById('shipping_phone');
            const addressInput = document.getElementById('shipping_address');

            if (nameInput && cacheName) nameInput.value = cacheName;
            if (emailInput && cacheEmail) emailInput.value = cacheEmail;
            if (phoneInput && cachePhone) phoneInput.value = cachePhone;
            if (addressInput && cacheAddress) addressInput.value = cacheAddress;
        }
    } catch (error) {
        console.error('Error loading checkout details:', error);
    }
}

// 3D Credit Card formatting and flipping effects
function setupCreditCardMockup() {
    const card = document.getElementById('cardVisual');
    const cardNumberInput = document.getElementById('card_number');
    const cardHolderInput = document.getElementById('card_holder');
    const cardExpiryInput = document.getElementById('card_expiry');
    const cardCvvInput = document.getElementById('card_cvv');

    if (!card) return;

    // Flip helpers
    if (cardCvvInput) {
        cardCvvInput.addEventListener('focus', () => { card.classList.add('flipped'); });
        cardCvvInput.addEventListener('blur', () => { card.classList.remove('flipped'); });
    }

    // Number formatter
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            // Limit to 16 digits
            val = val.substring(0, 16);
            
            // Format input spacing
            let formatted = val.match(/.{1,4}/g);
            e.target.value = formatted ? formatted.join(' ') : '';

            // Update card mockup display
            let mockupVal = val.padEnd(16, '•');
            let groupedMockup = mockupVal.match(/.{1,4}/g).join(' ');
            document.getElementById('displayCardNumber').innerText = groupedMockup;
        });
    }

    // Name formatter
    if (cardHolderInput) {
        cardHolderInput.addEventListener('input', (e) => {
            let val = e.target.value;
            document.getElementById('displayCardName').innerText = val ? val.toUpperCase() : 'CARDHOLDER NAME';
        });
    }

    // Expiry formatter
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) val = val.substring(0, 4);

            if (val.length > 2) {
                e.target.value = val.substring(0, 2) + '/' + val.substring(2);
            } else {
                e.target.value = val;
            }

            // Update card mockup display
            let month = val.substring(0, 2).padEnd(2, '•');
            let year = val.substring(2, 4).padEnd(2, '•');
            document.getElementById('displayCardExpiry').innerText = `${month}/${year}`;
        });
    }

    // CVV input
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 3);
            e.target.value = val;
            document.getElementById('displayCardCvv').innerText = val.padEnd(3, '•');
        });
    }
}

// Handle Payment form submission
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            // Step 1: Create the Order
            const checkoutResponse = await fetch(`/order/checkout?user_id=${userId}`, {
                method: 'POST'
            });

            const checkoutData = await checkoutResponse.json();

            if (!checkoutResponse.ok) {
                showToast(checkoutData.detail || 'Failed to create order.', 'error');
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                return;
            }

            const orderId = checkoutData.order_id;
            const totalAmount = checkoutData.total;
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'card';

            // Step 2: Make mock payment API call
            const paymentResponse = await fetch(`/payment/?order_id=${orderId}&amount=${totalAmount}&payment_method=${paymentMethod}`, {
                method: 'POST'
            });

            if (paymentResponse.ok) {
                // Show gorgeous success overlay animation
                const overlay = document.getElementById('successOverlay');
                if (overlay) {
                    overlay.classList.add('active');
                } else {
                    showToast('Payment successful! Order processed.', 'success');
                }

                setTimeout(() => {
                    window.location.href = '/orders-page';
                }, 3000);
            } else {
                const payData = await paymentResponse.json();
                showToast(payData.detail || 'Payment transaction failed. Please retry.', 'error');
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Checkout transaction failed.', 'error');
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// MY ORDERS PANEL
// ==========================================
async function fetchOrders() {
    const userId = localStorage.getItem('userId');
    const list = document.getElementById('ordersHistoryList');
    if (!list) return; // not on orders history page

    if (!userId) {
        window.location.href = '/login-page';
        return;
    }

    try {
        const response = await fetch(`/order/${userId}`);
        if (response.ok) {
            const orders = await response.json();
            renderOrdersPage(orders);
        } else {
            list.innerHTML = `<p style="color:var(--error-color);">Failed to retrieve order history.</p>`;
        }
    } catch (error) {
        console.error('Error fetching order history:', error);
    }
}

function renderOrdersPage(orders) {
    const list = document.getElementById('ordersHistoryList');
    if (!list) return;

    if (orders.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open empty-icon"></i>
                <h3 class="empty-title">No Orders Found</h3>
                <p class="empty-desc">You haven't placed any orders in the store yet.</p>
                <a href="/products-page" class="btn-primary" style="display:inline-flex; width:auto; padding:12px 24px; text-decoration:none;">
                    Browse Catalog
                </a>
            </div>
        `;
        return;
    }

    list.innerHTML = '';

    orders.forEach((order, index) => {
        const accordion = document.createElement('div');
        accordion.className = 'order-accordion-item';
        accordion.style.animationDelay = `${index * 0.08}s`;

        const isCompleted = order.status === 'completed';
        const badgeClass = isCompleted ? 'status-completed' : 'status-pending';
        const statusText = order.status;

        // Populate inner item summaries
        let itemsHtml = '';
        order.items.forEach(item => {
            const imageUrl = item.image ? '/' + item.image.replace(/\\/g, '/') : '/static/placeholder.png';
            itemsHtml += `
                <div class="order-inner-item">
                    <div class="order-item-meta">
                        <img src="${imageUrl}" alt="${escapeHtml(item.name)}" class="order-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80'">
                        <div class="order-item-details">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p>Qty: ${item.quantity} | Unit: $${parseFloat(item.price).toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="order-item-summary-price">
                        $${parseFloat(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `;
        });

        // Set up collapsible structure
        accordion.innerHTML = `
            <div class="order-accordion-header" onclick="toggleOrderAccordion(this)">
                <div class="order-id-label">#Order-${order.id}</div>
                <div class="order-amount-label">Total: $${parseFloat(order.total_amount).toFixed(2)}</div>
                <div class="order-date-label">Items: ${order.items.reduce((acc, item) => acc + item.quantity, 0)}</div>
                <div class="order-status-wrapper">
                    <span class="status-badge ${badgeClass}">${statusText}</span>
                </div>
                <i class="fa-solid fa-chevron-down order-accordion-arrow"></i>
            </div>
            
            <div class="order-accordion-content">
                <div class="order-content-inner">
                    <div style="font-weight: 700; text-align: left; font-size: 0.95rem; margin-bottom: 5px; color: white;">
                        Purchase Summary Details:
                    </div>
                    <div class="order-items-grid">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(accordion);
    });
}

function toggleOrderAccordion(header) {
    const item = header.parentElement;
    const content = header.nextElementSibling;
    
    // Toggle active state
    if (item.classList.contains('active')) {
        item.classList.remove('active');
        content.style.maxHeight = null;
    } else {
        // Collapse all other active accordions
        document.querySelectorAll('.order-accordion-item.active').forEach(activeItem => {
            activeItem.classList.remove('active');
            activeItem.querySelector('.order-accordion-content').style.maxHeight = null;
        });

        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
    }
}

// ==========================================
// AUTO-INITIALIZE ON DOM CONTENT LOADED
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbar();

    const currentPath = window.location.pathname;
    const userName = localStorage.getItem('userName');

    // Route Protection
    const protectedRoutes = ['/add-product-page', '/cart-page', '/checkout-page', '/orders-page'];
    if (protectedRoutes.includes(currentPath) && !userName) {
        showToast('Please sign in to access this page!', 'error');
        setTimeout(() => {
            window.location.href = '/login-page';
        }, 1500);
        return;
    }

    if (currentPath === '/products-page') {
        // Fetch product list
        fetchProducts();
    } else if (currentPath === '/cart-page') {
        // Fetch cart list
        fetchCartItems();
    } else if (currentPath === '/checkout-page') {
        // Checkout flow
        fetchCartForCheckout();
        setupCreditCardMockup();
    } else if (currentPath === '/orders-page') {
        // Fetch order history
        fetchOrders();
    }
});