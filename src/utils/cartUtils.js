

const CART_KEY = 'cloudmart_cart';

export const getCartItems = () => {
  const cartItems = localStorage.getItem(CART_KEY);
  return cartItems ? JSON.parse(cartItems) : [];
};

export const saveCartItems = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (product) => {
  const cartItems = getCartItems();
  const existingItem = cartItems.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  saveCartItems(cartItems);
};

export const removeFromCart = (productId) => {
  const cartItems = getCartItems();
  const updatedItems = cartItems.filter(item => item.id !== productId);
  saveCartItems(updatedItems);
};

export const updateCartItemQuantity = (productId, quantity) => {
  const cartItems = getCartItems();
  const item = cartItems.find(item => item.id === productId);
  if (item) {
    item.quantity = quantity;
    saveCartItems(cartItems);
  }
};

export const getCartItemsCount = () => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

export const clearCart = () => {
  saveCartItems([]);
  // localStorage.removeItem('cloudmart_cart');
};