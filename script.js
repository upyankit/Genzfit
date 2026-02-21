// API Base URL (adjust if port is 8080: 'http://localhost:8080/GenzFit/api/')
const API_BASE = 'http://localhost/GenzFit/api/';



// Global variables
let cart = JSON.parse(localStorage.getItem('gezfitCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('gezfitWishlist')) || [];
let currentUser = JSON.parse(localStorage.getItem('gezfitUser')) || null;
let allProducts = [];

// Migrate cart to new structure if needed
cart = cart.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity || 1,
    size: item.size || 'small'
}));
localStorage.setItem('gezfitCart', JSON.stringify(cart));

// Global for remove confirmation (generic for cart/wishlist)
let removeCallback = null;
let removeProductId = null;
let removeProductName = null;
let removeFromSection = null;  // 'cart' or 'wishlist'

// Update badges
function updateBadges() {
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');

    cartCount.textContent = cart.length;
    wishlistCount.textContent = wishlist.length;

    cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    wishlistCount.style.display = wishlist.length > 0 ? 'block' : 'none';

    console.log('Updating badges - Cart:', cart.length, 'Wishlist:', wishlist.length);
}

// Show toast notification (bottom-right, auto-dismiss after 3s)
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('successToast');
    const toastBody = document.getElementById('toastMessage');
    const icon = toastEl.querySelector('i');

    toastBody.textContent = message;
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle text-danger me-2';
        toastEl.querySelector('strong').textContent = 'Error';
    } else {
        icon.className = 'fas fa-check-circle text-success me-2';
        toastEl.querySelector('strong').textContent = 'Success';
    }

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Show center-bottom toast notification
function showCenterBottomToast(message) {
    // Create a temporary toast element for center-bottom positioning
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-50 start-50 translate-middle-x';
    toastContainer.style.zIndex = '9999';

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white bg-success border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.setAttribute('data-bs-delay', '2000');  // Auto-dismiss after 2 seconds

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    document.body.appendChild(toastContainer);

    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Remove the toast container after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

// Add to cart
function addToCart(productId, productName) {
    if (!cart.find(item => item.id === productId)) {
        cart.push({ id: productId, name: productName, quantity: 1, size: 'small' });
        localStorage.setItem('gezfitCart', JSON.stringify(cart));
        updateBadges();
        showToast(`${productName} added to cart!`);
    } else {
        showToast(`${productName} is already in your cart.`, 'error');
    }
}

// Add to wishlist
function addToWishlist(productId, productName) {
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({ id: productId, name: productName, quantity: 1, size: 'small' });
        localStorage.setItem('gezfitWishlist', JSON.stringify(wishlist));
        updateBadges();
        showToast(`${productName} successfully added to wishlist!`);
    } else {
        showToast(`${productName} is already in your wishlist.`, 'error');
    }
}

// Update cart quantity
function updateCartQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
        // Remove item if quantity is 0 or invalid
        removeFromCart(productId);
        return;
    }
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('gezfitCart', JSON.stringify(cart));
        populateCartModal();  // Refresh modal and total
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('gezfitCart', JSON.stringify(cart));
    updateBadges();
    populateCartModal();  // Refresh modal and total
    showCenterBottomToast('Item removed from cart successfully!');
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('gezfitWishlist', JSON.stringify(wishlist));
    updateBadges();
    populateWishlistModal();  // Refresh modal and total
    showCenterBottomToast('Item removed from wishlist successfully!');
}

// Move to wishlist from cart
function moveToWishlist(productId, productName) {
    // Remove from cart
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('gezfitCart', JSON.stringify(cart));
    
    // Add to wishlist if not already there
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({ id: productId, name: productName });
        localStorage.setItem('gezfitWishlist', JSON.stringify(wishlist));
    }
    
    updateBadges();
    populateCartModal();  // Refresh cart modal
    showToast(`${productName} moved to wishlist.`);
}

// Add to cart from wishlist
function addToCartFromWishlist(productId, productName) {
    addToCart(productId, productName);
    // Optionally remove from wishlist after adding to cart (uncomment if desired)
    // removeFromWishlist(productId);
}

// Clear all wishlist
function clearWishlist() {
    wishlist = [];
    localStorage.setItem('gezfitWishlist', JSON.stringify(wishlist));
    updateBadges();
    populateWishlistModal();
    showCenterBottomToast('Wishlist cleared successfully!');
}

// Setup remove confirmation modal (generic)
function setupRemoveConfirmation(productId, productName, section, callback) {
    removeProductId = productId;
    removeProductName = productName;
    removeFromSection = section;
    removeCallback = callback;
    
    document.getElementById('removeProductName').textContent = productName;
    document.getElementById('removeFromSection').textContent = section;
    
    const modal = new bootstrap.Modal(document.getElementById('removeConfirmModal'));
    modal.show();
    
    // Confirm button event (one-time, as modal is reused)
    document.getElementById('confirmRemoveBtn').onclick = () => {
        if (removeCallback) {
            removeCallback(productId);
        }
        modal.hide();
        // Reset for next use
        document.getElementById('confirmRemoveBtn').onclick = null;
    };
}

// Load all products
async function loadAllProducts() {
    try {
        console.log('Fetching products from:', `${API_BASE}get_products.php`);
        const response = await fetch(`${API_BASE}get_products.php`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch products'}`);
        }
        allProducts = await response.json();
        console.log('Loaded products:', allProducts);
        
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
            console.warn('No products in DB.');
            return;
        }
        
        // Populate sliders with 8 products each
        populateSection('topDealsSlider', getTopDealsProducts());
        populateSection('festivalSpecialSlider', getFestivalSpecialProducts());
        populateSection('mensClothingSlider', getMensClothingProducts());
        populateSection('womenClothingSlider', getWomenClothingProducts());
        populateSection('footwareSlider', getFootwareProducts());
        populateSection('accessoriesSlider', getAccessoriesProducts());
        populateSection('kidsFastionSlider', getKidsFastionProducts());
    } catch (error) {
        console.error('Load error:', error);
        // Show error in sliders
        document.querySelectorAll('.product-slider').forEach(slider => {
            slider.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load products: ' + error.message + '</div></div>';
        });
    }
}

// Filter helpers (8 products each)
function getTopDealsProducts() {
    return allProducts
        .filter(p => parseFloat(p.price) > 30)  // High-price for deals
        .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))  // Descending price
        .slice(0, 8);
}

function getFestivalSpecialProducts() {
    return allProducts.sort(() => 0.5 - Math.random()).slice(0, 8);  // Random for festival
}

function getMensClothingProducts() {
    return allProducts.filter(p => p.category === 'men').slice(0, 8);
}

function getWomenClothingProducts() {
    return allProducts.filter(p => p.category === 'women').slice(0, 8);
}

function getFootwareProducts() {
    const keywords = ['shoe', 'sneaker', 'boot', 'foot', 'sandal'];
    return allProducts.filter(p => keywords.some(kw => p.name.toLowerCase().includes(kw.toLowerCase()))).slice(0, 8);
}

function getAccessoriesProducts() {
    return allProducts.filter(p => p.category === 'home_beauty' || p.category === 'genz').slice(0, 8);
}

function getKidsFastionProducts() {
    return allProducts.filter(p => p.category === 'kids').slice(0, 8);
}

// Populate slider section
function populateSection(sliderId, products) {
    const slider = document.getElementById(sliderId);
    if (!slider) {
        console.error(`Slider ${sliderId} not found.`);
        return;
    }
    
    slider.innerHTML = '';  // Clear
    
    if (products.length === 0) {
        slider.innerHTML = '<div class="col-12"><div class="alert alert-warning">No products available in this section.</div></div>';
        console.warn(`No products for ${sliderId}.`);
        return;
    }
    
    if (products.length < 8) {
        console.warn(`Only ${products.length} products for ${sliderId}; expected 8. Add more to DB.`);
    }
    
    console.log(`Populating ${sliderId} with ${products.length} products (showing first 8).`);
    
    products.slice(0, 8).forEach((product, index) => {
        const imgSrc = product.image_url || `https://via.placeholder.com/250x200?text=${encodeURIComponent(product.name.substring(0, 10))}`;
        console.log(`Product ${index + 1} (${product.name}): Using image URL: ${imgSrc}`);
        
        const card = document.createElement('div');
        card.className = 'card product-card';  // product-card for responsive sizing
        card.innerHTML = `
            <img src="${imgSrc}" 
                 class="card-img-top" alt="${product.name}" 
                 onload="console.log('SUCCESS: Image loaded for ${product.name}');"
                 onerror="console.error('FAILED: Image load error for ${product.name} - URL: ${imgSrc}. Check file path or DB.'); this.src='https://via.placeholder.com/250x200?text=Image+Error';"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description || 'No description available'}</p>
                <p class="card-text"><strong>$${parseFloat(product.price).toFixed(2)}</strong></p>
                <button class="btn btn-primary me-2" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}')">Add to Cart</button>
                <button class="btn btn-outline-danger" onclick="addToWishlist(${product.id}, '${product.name.replace(/'/g, "\\'")}')"><i class="fas fa-heart"></i></button>
            </div>
        `;
        slider.appendChild(card);
    });
}

// Wishlist Modal Functions
function openWishlistModal() {
    const modal = new bootstrap.Modal(document.getElementById('wishlistModal'));
    populateWishlistModal();
    modal.show();
}

function populateWishlistModal() {
    const body = document.getElementById('wishlistBody');
    const itemCount = document.getElementById('wishlistItemCount');
    const totalEl = document.getElementById('wishlistTotal');
    const clearBtn = document.getElementById('clearWishlistBtn');
    
    itemCount.textContent = wishlist.length;
    
    if (wishlist.length === 0) {
        body.innerHTML = '<div class="text-center py-4"><i class="fas fa-heart fa-3x text-muted mb-3"></i><p class="text-muted">Your wishlist is empty. Start adding your favorites!</p><a href="#" class="btn btn-primary" data-bs-dismiss="modal">Continue Shopping</a></div>';
        totalEl.textContent = '0.00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    wishlist.forEach(wishlistItem => {
        const product = allProducts.find(p => p.id === wishlistItem.id);
        if (product) {
            const price = parseFloat(product.price);
            total += price;  // Assume qty 1; extend if multiples
            html += `
                <div class="wishlist-item d-flex align-items-center p-3 border-bottom">
                    <img src="${product.image_url || 'https://via.placeholder.com/40x40?text=' + encodeURIComponent(product.name.substring(0, 3))}"
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/40x40?text=Img';"
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 3px; flex-shrink: 0;">
                    <div class="wishlist-item-info flex-grow-1 ms-3">
                        <h6 class="mb-1">${product.name}</h6>
                        <p class="mb-1"><strong>$${price.toFixed(2)}</strong></p>
                        <small class="text-muted">Qty: 1</small>
                    </div>
                    <div class="wishlist-item-actions d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="addToCartFromWishlist(${wishlistItem.id}, '${product.name.replace(/'/g, "\\'")}')">Add to Cart</button>
                        <button class="btn btn-danger btn-sm" onclick="removeFromWishlist(${wishlistItem.id})">Remove</button>
                    </div>
                </div>
            `;
        } else {
            console.warn(`Product not found for wishlist item ID: ${wishlistItem.id}`);
        }
    });
    
    body.innerHTML = html || '<p class="text-muted">No valid items in wishlist.</p>';
    totalEl.textContent = total.toFixed(2);
}

// Cart Modal Functions
function openCartModal() {
    const modal = new bootstrap.Modal(document.getElementById('cartModal'));
    populateCartModal();
    modal.show();
}

function populateCartModal() {
    const body = document.getElementById('cartBody');
    const itemCount = document.getElementById('cartItemCount');
    const totalEl = document.getElementById('cartTotal');

    itemCount.textContent = cart.length;

    if (cart.length === 0) {
        body.innerHTML = '<div class="text-center py-4"><i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i><p class="text-muted">Your cart is empty.</p><a href="#" class="btn btn-primary" data-bs-dismiss="modal">Continue Shopping</a></div>';
        totalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    let html = '';

    cart.forEach(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.id);
        if (product) {
            const price = parseFloat(product.price);
            const quantity = cartItem.quantity || 1;
            total += price * quantity;
            html += `
                <div class="cart-item d-flex align-items-center p-3 border-bottom">
                    <img src="${product.image_url || 'https://via.placeholder.com/30x30?text=' + encodeURIComponent(product.name.substring(0, 3))}"
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/30x30?text=Img';"
                         style="width: 30px; height: 30px; object-fit: cover; border-radius: 3px; flex-shrink: 0;">
                    <div class="cart-item-info flex-grow-1 ms-3">
                        <h6 class="mb-1">${product.name}</h6>
                        <p class="mb-1"><strong>$${price.toFixed(2)}</strong></p>
                        <div class="d-flex align-items-center gap-2">
                            <label for="qty-${cartItem.id}" class="form-label mb-0">Qty:</label>
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateCartQuantity(${cartItem.id}, ${quantity - 1})">-</button>
                            <input type="number" id="qty-${cartItem.id}" class="form-control form-control-sm" style="width: 60px;" min="1" value="${quantity}" onchange="updateCartQuantity(${cartItem.id}, this.value)">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateCartQuantity(${cartItem.id}, ${quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="moveToWishlist(${cartItem.id}, '${product.name.replace(/'/g, "\\'")}')">Wishlist</button>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${cartItem.id})">Remove</button>
                    </div>
                </div>
            `;
        } else {
            console.warn(`Product not found for cart item ID: ${cartItem.id}`);
        }
    });

    body.innerHTML = html || '<p class="text-muted">No valid items in cart.</p>';
    totalEl.textContent = total.toFixed(2);
}

// Checkout (extend to your backend/form)
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    const total = cart.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.id);
        const quantity = item.quantity || 1;
        return sum + (product ? parseFloat(product.price) * quantity : 0);
    }, 0);
    // Close cart modal and open checkout modal
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    document.getElementById('checkoutTotal').textContent = total.toFixed(2);
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();

    // Reopen cart modal if checkout is cancelled (modal hidden without payment success)
    document.getElementById('checkoutModal').addEventListener('hidden.bs.modal', () => {
        if (cart.length > 0) {  // Only reopen if cart is not empty (payment not successful)
            openCartModal();
        }
    }, { once: true });  // Use once to avoid multiple listeners
}

// Function to update profile UI
function updateProfile() {
    console.log('Updating profile, currentUser:', currentUser);
    if (currentUser) {
        console.log('Updating profile for logged-in user:', currentUser.name);
        const profileToggle = document.getElementById('profileToggle');
        profileToggle.innerHTML = `<i class="fas fa-user"></i> Welcome, ${currentUser.name}`;

        // Update dropdown menu: replace Login/Register with Modify Profile button and add Logout button
        const dropdownMenu = profileToggle.nextElementSibling; // Assuming dropdown-menu is next sibling
        const loginItem = dropdownMenu.querySelector('a[data-bs-target="#authModal"]');
        if (loginItem) {
            loginItem.parentElement.innerHTML = '<button class="dropdown-item" type="button" id="modifyProfileBtn">Modify Profile</button>';
        }
        // Add Logout button
        const logoutItem = document.createElement('li');
        logoutItem.innerHTML = '<button class="dropdown-item" type="button" id="logoutBtn">Logout</button>';
        dropdownMenu.appendChild(logoutItem);

        // Add event listener for logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('gezfitUser');
            localStorage.removeItem('gezfitCart'); // Optional: clear cart on logout
            localStorage.removeItem('gezfitWishlist'); // Optional: clear wishlist on logout
            location.reload();
        });

        // Placeholder for Modify Profile (can be expanded later)
        document.getElementById('modifyProfileBtn').addEventListener('click', () => {
            alert('Modify Profile feature coming soon!');
        });
    } else {
        console.log('No current user, profile not updated');
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchDropdown.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${API_BASE}search_products.php?q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();

            searchDropdown.innerHTML = '';
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.className = 'dropdown-item';
                    li.textContent = suggestion.name;
                    li.addEventListener('click', () => {
                        searchInput.value = suggestion.name;
                        searchDropdown.style.display = 'none';
                        console.log('Selected:', suggestion.name);
                        // Optional: Filter sections or navigate
                    });
                    searchDropdown.appendChild(li);
                });
                searchDropdown.style.display = 'block';
            } else {
                searchDropdown.style.display = 'none';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchDropdown.style.display = 'none';
        }
    });

    // Hide dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
        }
    });

    // Initial load: Products, badges, profile
    loadAllProducts();
    updateBadges();
    updateProfile();
    
    // Cart link: Open modal instead of alert
    document.getElementById('cartLink').addEventListener('click', (e) => {
        e.preventDefault();
        openCartModal();
    });
    
    // Wishlist link: Open modal
    document.getElementById('wishlistLink').addEventListener('click', (e) => {
        e.preventDefault();
        openWishlistModal();
    });
    
    // Checkout button in modal
    document.getElementById('checkoutBtn').addEventListener('click', proceedToCheckout);

    // Password toggle for login
    document.getElementById('toggleLoginPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('loginPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password toggle for register password
    document.getElementById('toggleRegisterPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('registerPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password toggle for register confirm password
    document.getElementById('toggleRegisterConfirmPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('registerConfirmPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password toggle for admin login
    document.getElementById('toggleAdminPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('adminPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password toggle for main login
    document.getElementById('toggleMainLoginPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('mainLoginPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Login type radio button event listeners
    document.querySelectorAll('input[name="loginType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const emailGroup = document.getElementById('emailInputGroup');
            const mobileGroup = document.getElementById('mobileInputGroup');
            const emailInput = document.getElementById('loginEmail');
            const mobileInput = document.getElementById('loginMobile');

            if (this.value === 'email') {
                emailGroup.classList.remove('d-none');
                mobileGroup.classList.add('d-none');
                emailInput.required = true;
                mobileInput.required = false;
            } else {
                emailGroup.classList.add('d-none');
                mobileGroup.classList.remove('d-none');
                emailInput.required = false;
                mobileInput.required = true;
            }
        });
    });

    // Show login alert on profile if not logged in
    if (!currentUser) {
        setTimeout(() => {
            const profileToggle = document.getElementById('profileToggle');
            if (profileToggle) {
                const rect = profileToggle.getBoundingClientRect();
                const toastContainer = document.createElement('div');
                toastContainer.className = 'toast-container position-fixed';
                toastContainer.style.top = (rect.top - 60) + 'px';
                toastContainer.style.left = (rect.left - 100) + 'px';
                toastContainer.style.zIndex = '9999';

                const toastEl = document.createElement('div');
                toastEl.className = 'toast align-items-center text-white bg-warning border-0';
                toastEl.setAttribute('role', 'alert');
                toastEl.setAttribute('aria-live', 'assertive');
                toastEl.setAttribute('aria-atomic', 'true');
                toastEl.setAttribute('data-bs-delay', '60000');  // 1 minute

                toastEl.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-user me-2"></i>
                            Please login to access your profile.
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                `;

                toastContainer.appendChild(toastEl);
                document.body.appendChild(toastContainer);

                const toast = new bootstrap.Toast(toastEl);
                toast.show();

                toastEl.addEventListener('hidden.bs.toast', () => {
                    if (document.body.contains(toastContainer)) {
                        document.body.removeChild(toastContainer);
                    }
                });
            }
        }, 1000);  // Show after 1 second
    }
});

// Auth Modal: Show on every load if not logged in
if (!currentUser) {
    window.addEventListener('load', () => {
        const authModal = new bootstrap.Modal(document.getElementById('authModal'), {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        authModal.show();
    });
}



// Login button (password + OTP mandatory)
document.getElementById('loginBtn').addEventListener('click', async () => {
    const loginType = document.querySelector('input[name="loginType"]:checked').value;
    let identifier;
    if (loginType === 'email') {
        identifier = document.getElementById('loginEmail').value.trim();
    } else {
        const countryCode = document.getElementById('loginCountryCode').value;
        const mobile = document.getElementById('loginMobile').value.trim();
        identifier = countryCode + mobile;
    }
    const password = document.getElementById('loginPassword').value.trim();

    if (!password) {
        showCenterBottomToast('Please enter password.');
        return;
    }

    if (!identifier) {
        showCenterBottomToast('Please enter email or mobile.');
        return;
    }

    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true; // Disable button to prevent multiple clicks
    loginBtn.textContent = 'Verifying...';

    try {
        const response = await fetch(`${API_BASE}login_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const result = await response.json();

        if (result.success) {
            // Password valid, automatically send OTP
            try {
                const otpResponse = await fetch(`${API_BASE}request_otp.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });
                const otpResult = await otpResponse.json();

                if (otpResult.success) {
                    document.getElementById('otpSection').style.display = 'block';
                    // Add countdown timer for OTP validity
                    let countdown = 30; // 30 seconds
                    const otpInput = document.getElementById('loginOtp');
                    const submitBtn = document.getElementById('otpLoginBtn');
                    // Enable input immediately, disable submit if expired
                    otpInput.disabled = false;
                    if (submitBtn) submitBtn.disabled = false;
                    const countdownEl = document.createElement('p');
                    countdownEl.id = 'otpCountdown';
                    countdownEl.textContent = `OTP expires in ${countdown} seconds.`;
                    countdownEl.style.color = 'red';
                    document.getElementById('otpSection').appendChild(countdownEl);
                    const interval = setInterval(() => {
                        countdown--;
                        countdownEl.textContent = `OTP expires in ${countdown} seconds.`;
                        if (countdown <= 0) {
                            clearInterval(interval);
                            countdownEl.textContent = 'OTP expired. Request a new one.';
                            if (loginBtn) {
                                loginBtn.disabled = false; // Re-enable button
                                loginBtn.textContent = 'Login'; // Reset text
                            }
                            if (submitBtn) submitBtn.disabled = true;
                        }
                    }, 1000);
                    if (loginBtn) {
                        loginBtn.disabled = false; // Re-enable button after OTP sent
                        loginBtn.textContent = 'Resend OTP'; // Change text after successful send
                    }
                    showCenterBottomToast(`OTP sent to ${identifier}. For testing: ${otpResult.otp}`); // Remove in production
                } else {
                    showCenterBottomToast(otpResult.message || 'Failed to send OTP');
                    if (loginBtn) {
                        loginBtn.disabled = false; // Re-enable on failure
                        loginBtn.textContent = 'Login'; // Reset text
                    }
                }
            } catch (otpError) {
                console.error('OTP request error:', otpError);
                showCenterBottomToast('OTP request error: ' + otpError.message);
                loginBtn.disabled = false; // Re-enable on error
                loginBtn.textContent = 'Login'; // Reset text
            }
        } else {
            showCenterBottomToast(result.message || 'Invalid credentials');
            loginBtn.disabled = false; // Re-enable on invalid credentials
            loginBtn.textContent = 'Login'; // Reset text
        }
    } catch (error) {
        console.error('Password login error:', error);
        showCenterBottomToast('Login error: ' + error.message);
        loginBtn.disabled = false; // Re-enable on error
        loginBtn.textContent = 'Login'; // Reset text
    }
});

// OTP Login button click (verify OTP)
document.getElementById('otpLoginBtn').addEventListener('click', async () => {
    const loginType = document.querySelector('input[name="loginType"]:checked').value;
    let identifier;
    if (loginType === 'email') {
        identifier = document.getElementById('loginEmail').value;
    } else {
        const countryCode = document.getElementById('loginCountryCode').value;
        const mobile = document.getElementById('loginMobile').value;
        identifier = countryCode + mobile;
    }
    const otp = document.getElementById('loginOtp').value;

    try {
        const response = await fetch(`${API_BASE}verify_otp.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, otp })
        });
        const result = await response.json();

        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('gezfitUser', JSON.stringify(currentUser));
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            // Show success popup for 30 seconds
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-50 start-50 translate-middle-x';
            toastContainer.style.zIndex = '9999';

            const toastEl = document.createElement('div');
            toastEl.className = 'toast align-items-center text-white bg-success border-0';
            toastEl.setAttribute('role', 'alert');
            toastEl.setAttribute('aria-live', 'assertive');
            toastEl.setAttribute('aria-atomic', 'true');
            toastEl.setAttribute('data-bs-delay', '30000');  // 30 seconds

            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>
                        Successfully logged in!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;

            toastContainer.appendChild(toastEl);
            document.body.appendChild(toastContainer);

            const toast = new bootstrap.Toast(toastEl);
            toast.show();

            // Remove the toast container after it's hidden
            toastEl.addEventListener('hidden.bs.toast', () => {
                document.body.removeChild(toastContainer);
            });
            location.reload();  // Refresh to update profile
        } else {
            showCenterBottomToast(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('OTP login error:', error);
        showCenterBottomToast('Login error: ' + error.message);
    }
});

// Register form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if user is already logged in
    if (currentUser) {
        showCenterBottomToast('Please logout first before registering.');
        return;
    }

    const username = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const mobile = document.getElementById('registerMobile').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showCenterBottomToast('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, mobile, password, confirmPassword })
});

        const result = await response.json();

        if (result.success) {
            // Clear the form
            document.getElementById('registerForm').reset();
            // Switch to login tab
            document.getElementById('login-tab').click();
            // Show success message
            showCenterBottomToast('Registration successful! Please login to continue.');
        } else {
            showCenterBottomToast(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        showCenterBottomToast('Registration error: ' + error.message);
    }
});

// Payment processing with Stripe
const stripe = Stripe('pk_test_your_publishable_key_here');  // Replace with your publishable key
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#cardNumber');  // Mount to the card number field

// Handle Pay Now button
document.getElementById('payNowBtn').addEventListener('click', async () => {
    const billingName = document.getElementById('billingName').value;
    const billingEmail = document.getElementById('billingEmail').value;
    const billingAddress = document.getElementById('billingAddress').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const total = parseFloat(document.getElementById('checkoutTotal').textContent);

    if (!billingName || !billingEmail || !billingAddress) {
        document.getElementById('checkoutError').textContent = 'Please fill in all billing details.';
        document.getElementById('checkoutError').style.display = 'block';
        return;
    }

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
            name: billingName,
            email: billingEmail,
            address: {
                line1: billingAddress,
            },
        },
    });

    if (error) {
        document.getElementById('checkoutError').textContent = error.message;
        document.getElementById('checkoutError').style.display = 'block';
        return;
    }

    // Send to backend
    try {
        const response = await fetch(`${API_BASE}process_payment.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                amount: Math.round(total * 100),  // Convert to cents
                billing: {
                    name: billingName,
                    email: billingEmail,
                    address: billingAddress,
                },
                cartItems: cart,  // Send cart items for order storage
            }),
        });
        const result = await response.json();

        if (result.success) {
            // Clear cart
            cart = [];
            localStorage.setItem('gezfitCart', JSON.stringify(cart));
            updateBadges();
            // Close modal and show success alert
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            alert('Your order has been successfully placed! A confirmation email has been sent to ' + billingEmail + '.');
            // Optionally redirect or show order confirmation
        } else {
            document.getElementById('checkoutError').textContent = result.message;
            document.getElementById('checkoutError').style.display = 'block';
        }
    } catch (err) {
        document.getElementById('checkoutError').textContent = 'Payment processing error.';
        document.getElementById('checkoutError').style.display = 'block';
    }
});

// Main Login Form Handler
document.getElementById('mainLoginBtn').addEventListener('click', async () => {
    const email = document.getElementById('mainLoginEmail').value;
    const password = document.getElementById('mainLoginPassword').value;

    if (!email || !password) {
        showCenterBottomToast('Please enter email and password.');
        return;
    }

    const loginBtn = document.getElementById('mainLoginBtn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';

    try {
        const response = await fetch(`${API_BASE}login_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: email, password })
        });
        const result = await response.json();

        if (result.success) {
            // Password valid, send OTP
            try {
                const otpResponse = await fetch(`${API_BASE}request_otp.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: email })
                });
                const otpResult = await otpResponse.json();

                if (otpResult.success) {
                    document.getElementById('mainOtpSection').style.display = 'block';
                    let countdown = 30;
                    const otpInput = document.getElementById('mainLoginOtp');
                    const submitBtn = document.getElementById('mainOtpSubmitBtn');
                    otpInput.disabled = false;
                    if (submitBtn) submitBtn.disabled = false;
                    const countdownEl = document.createElement('p');
                    countdownEl.id = 'mainOtpCountdown';
                    countdownEl.textContent = `OTP expires in ${countdown} seconds.`;
                    countdownEl.style.color = 'red';
                    document.getElementById('mainOtpSection').appendChild(countdownEl);
                    const interval = setInterval(() => {
                        countdown--;
                        countdownEl.textContent = `OTP expires in ${countdown} seconds.`;
                        if (countdown <= 0) {
                            clearInterval(interval);
                            if (submitBtn) submitBtn.disabled = true;
                            countdownEl.textContent = 'OTP expired. Request a new one.';
                            if (loginBtn) {
                                loginBtn.disabled = false;
                                loginBtn.textContent = 'Login';
                            }
                        }
                    }, 1000);
                    if (loginBtn) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Resend OTP';
                    }
                    showCenterBottomToast(`OTP sent to ${email}. For testing: ${otpResult.otp}`);
                } else {
                    showCenterBottomToast(otpResult.message || 'Failed to send OTP');
                    if (loginBtn) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                }
            } catch (otpError) {
                console.error('OTP request error:', otpError);
                showCenterBottomToast('OTP request error: ' + otpError.message);
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        } else {
            showCenterBottomToast(result.message || 'Invalid credentials');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    } catch (error) {
        console.error('Password login error:', error);
        showCenterBottomToast('Login error: ' + error.message);
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Main Login Form OTP Verification
document.getElementById('mainOtpSubmitBtn').addEventListener('click', async () => {
    const email = document.getElementById('mainLoginEmail').value;
    const otp = document.getElementById('mainLoginOtp').value;

    try {
        const response = await fetch(`${API_BASE}verify_otp.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: email, otp })
        });
        const result = await response.json();

        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('gezfitUser', JSON.stringify(currentUser));
            // Show success popup for 30 seconds
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-50 start-50 translate-middle-x';
            toastContainer.style.zIndex = '9999';

            const toastEl = document.createElement('div');
            toastEl.className = 'toast align-items-center text-white bg-success border-0';
            toastEl.setAttribute('role', 'alert');
            toastEl.setAttribute('aria-live', 'assertive');
            toastEl.setAttribute('aria-atomic', 'true');
            toastEl.setAttribute('data-bs-delay', '30000');  // 30 seconds

            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>
                        Login successfully!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;

            toastContainer.appendChild(toastEl);
            document.body.appendChild(toastContainer);

            const toast = new bootstrap.Toast(toastEl);
            toast.show();

            // Remove the toast container after it's hidden
            toastEl.addEventListener('hidden.bs.toast', () => {
                document.body.removeChild(toastContainer);
            });
            location.reload();  // Refresh to update profile
        } else {
            showCenterBottomToast(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('OTP login error:', error);
        showCenterBottomToast('Login error: ' + error.message);
    }
});

// Top Deals slider buttons (if using sliders; remove if grid) - Disabled for grid layout
// document.addEventListener('DOMContentLoaded', () => {
//     const slider = document.getElementById('topDealsSlider');
//     const leftBtn = document.getElementById('topDealsLeft');
//     const rightBtn = document.getElementById('topDealsRight');

//     if (slider && leftBtn && rightBtn) {
//         const cardWidth = 250 + 15;  // Card width + gap

//         leftBtn.addEventListener('click', () => {
//             slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
//         });

//         rightBtn.addEventListener('click', () => {
//             slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
//         });

//         // Disable buttons at ends (optional)
//         slider.addEventListener('scroll', () => {
//             leftBtn.disabled = slider.scrollLeft <= 0;
//             rightBtn.disabled = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth;
//         });
//     }
// });
