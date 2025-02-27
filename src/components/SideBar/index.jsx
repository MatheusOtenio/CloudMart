
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const SideBar = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-blue-700 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <button onClick={onClose} className="absolute top-4 right-4 focus:outline-none">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block px-2 py-2 hover:bg-blue-600" onClick={onClose}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/cart" className="block px-2 py-2 hover:bg-blue-600" onClick={onClose}>
                Cart
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="block px-2 py-2 hover:bg-blue-600" onClick={onClose}>
                My Orders
              </Link>
            </li>
            <li>
              <Link to="/about" className="block px-2 py-2 hover:bg-blue-600" onClick={onClose}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/customer-support" className="block px-2 py-2 hover:bg-blue-600" onClick={onClose}>
                Customer Support
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;