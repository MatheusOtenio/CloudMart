import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import {
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../../utils/cartUtils";
import { getUser } from "../../utils/userUtils";
import api from "../../config/axiosConfig";
const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const truncateName = (name, maxLength = 60) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover mr-4"
      />
      <div className="flex-grow min-w-0">
        {" "}
        {/* min-w-0 allows text truncation */}
        <h3 className="text-lg font-semibold truncate" title={item.name}>
          {truncateName(item.name)}
        </h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="px-2 py-1 bg-gray-200 rounded-l"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="px-2 py-1 bg-gray-200 rounded-r"
        >
          +
        </button>
      </div>
      <button onClick={() => onRemove(item.id)} className="ml-4 text-red-500">
        <Trash2 size={20} />
      </button>
    </div>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  total,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        <p className="mb-4">Are you sure you want to place this order?</p>
        <p className="font-semibold mb-6">Total: ${total.toFixed(2)}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Confirm Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setCartItems(getCartItems());
  }, []);

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    setCartItems(getCartItems());
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(id, newQuantity);
    setCartItems(getCartItems());
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getUser();
      if (!user || !user.email) {
        setError("Please log in to complete your order.");
        return;
      }

      const order = {
        userEmail: user.email,
        status: "Pending",
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };

      await api.post("/orders", order);
      clearCart();
      setCartItems([]); // Update local state
      setOrderSuccess(true);
      setIsConfirmationOpen(false);
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto py-8 flex-grow px-4">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {orderSuccess ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <p className="font-bold">Order Placed Successfully!</p>
            <p>
              Thank you for your order. This is a demo app, so no actual
              purchase has been made.
            </p>
            <Link
              to="/"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <p className="text-xl">
            Your cart is empty.{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
            <div className="mt-6 text-right">
              <p className="text-xl font-semibold">
                Total: ${totalPrice.toFixed(2)}
              </p>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <button
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                onClick={() => setIsConfirmationOpen(true)}
                disabled={loading}
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleCreateOrder}
        total={totalPrice}
        isLoading={loading}
      />
    </div>
  );
};

export default CartPage;
