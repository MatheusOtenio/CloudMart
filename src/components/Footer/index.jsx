import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-800 text-white py-4">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <h3 className="text-xl font-bold">CloudMart</h3>
          <p className="text-sm text-gray-400">Your AI-powered shopping destination</p>
        </div>
        <div className="w-full sm:w-auto">
          <ul className="flex flex-wrap justify-center sm:justify-end space-x-4">
            <li><Link to="/" className="hover:text-blue-300 text-sm">Home</Link></li>
            <li><Link to="/cart" className="hover:text-blue-300 text-sm">Cart</Link></li>
            <li><Link to="/my-orders" className="hover:text-blue-300 text-sm">My Orders</Link></li>

            <li><Link to="/about" className="hover:text-blue-300 text-sm">About</Link></li>
            <li><Link to="/customer-support" className="hover:text-blue-300 text-sm">Support</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>&copy; 2024 CloudMart. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;