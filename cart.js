/**
 * RAF CART - Premium Cart Functionality
 * Handles cart state, persistence, and UI updates.
 */

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('rafcart_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for "Add to Cart" buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-to-cart')) {
                const button = e.target.closest('.btn-add-to-cart');
                const product = {
                    id: button.dataset.id || Math.random().toString(36).substr(2, 9),
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    image: button.dataset.image,
                    quantity: 1
                };
                this.addToCart(product);
            }

            // Cart Toggle
            if (e.target.closest('.cart-toggle')) {
                this.toggleCartDrawer(true);
            }

            // Close Cart
            if (e.target.closest('.close-cart') || e.target.classList.contains('cart-overlay')) {
                this.toggleCartDrawer(false);
            }

            // Remove Item
            if (e.target.closest('.remove-item')) {
                const id = e.target.closest('.remove-item').dataset.id;
                this.removeFromCart(id);
            }
            // Checkout
            if (e.target.closest('.btn-checkout')) {
                this.handleCheckout();
            }
        });
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification("Your cart is empty!");
            return;
        }

        const checkoutBtn = document.querySelector('.btn-checkout');
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = "Processing...";
        checkoutBtn.disabled = true;

        setTimeout(() => {
            this.showCheckoutSuccess();
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.toggleCartDrawer(false);
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }, 1500);
    }

    showCheckoutSuccess() {
        const modal = document.querySelector('.checkout-modal');
        const overlay = document.querySelector('.modal-overlay');
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }
        this.saveCart();
        this.updateCartUI();
        this.toggleCartDrawer(true);
        this.showNotification(`Added ${product.name} to cart!`);
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
    }

    saveCart() {
        localStorage.setItem('rafcart_cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        // Update Count
        const counts = document.querySelectorAll('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        counts.forEach(c => {
            c.textContent = totalItems;
            c.style.display = totalItems > 0 ? 'flex' : 'none';
        });

        // Update Drawer Content
        const cartContent = document.querySelector('.cart-items');
        if (cartContent) {
            if (this.cart.length === 0) {
                cartContent.innerHTML = `
                    <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                        <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.2;"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
            } else {
                cartContent.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }
        }

        // Update Total
        const totalEl = document.querySelector('.cart-total-amount');
        if (totalEl) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    toggleCartDrawer(isOpen) {
        const drawer = document.querySelector('.cart-drawer');
        const overlay = document.querySelector('.cart-overlay');
        if (drawer && overlay) {
            if (isOpen) {
                drawer.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    showNotification(message) {
        // Simple notification logic
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('active'), 10);
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize Cart on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
