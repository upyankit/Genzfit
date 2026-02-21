// API Base URL
const API_BASE = 'http://localhost/GenzFit/api/';

// Global variables
let currentUser = JSON.parse(localStorage.getItem('gezfitUser')) || null;
let allProducts = [];

// Check if admin is logged in
if (!currentUser || !currentUser.is_admin) {
    window.location.href = 'index.html';
}

// Show toast notification
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

// Load all products
async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}get_products.php`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        allProducts = await response.json();
        populateProductsTable();
    } catch (error) {
        console.error('Load products error:', error);
        showToast('Failed to load products: ' + error.message, 'error');
    }
}

// Populate products table
function populateProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }

    allProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.description || 'N/A'}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.category}</td>
            <td><img src="${product.image_url || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add product
document.getElementById('saveProductBtn').addEventListener('click', async () => {
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const imageFile = document.getElementById('productImage').files[0];

    if (!name || !price || !category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE}add_product.php`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showToast('Product added successfully');
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            document.getElementById('addProductForm').reset();
            loadAllProducts();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Add product error:', error);
        showToast('Failed to add product: ' + error.message, 'error');
    }
});

// Edit product
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = product.category;
    // Note: File inputs cannot be pre-filled for security reasons

    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
}

// Update product
document.getElementById('updateProductBtn').addEventListener('click', async () => {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value;
    const description = document.getElementById('editProductDescription').value;
    const price = document.getElementById('editProductPrice').value;
    const category = document.getElementById('editProductCategory').value;
    const imageFile = document.getElementById('editProductImage').files[0];

    if (!name || !price || !category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE}update_product.php`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showToast('Product updated successfully');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            loadAllProducts();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Update product error:', error);
        showToast('Failed to update product: ' + error.message, 'error');
    }
});

// Delete product
function deleteProduct(id, name) {
    document.getElementById('deleteProductName').textContent = name;
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            const response = await fetch(`${API_BASE}delete_product.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await response.json();

            if (result.success) {
                showToast('Product deleted successfully');
                modal.hide();
                loadAllProducts();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Delete product error:', error);
            showToast('Failed to delete product: ' + error.message, 'error');
        }
    };
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('gezfitUser');
    window.location.href = 'index.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
});
