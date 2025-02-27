import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, User } from 'lucide-react';
import SideBar from '../SideBar';
import { getUser } from '../../utils/userUtils';
import { getCartItemsCount } from '../../utils/cartUtils';

const Header = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [userName, setUserName] = useState('Anonymous');
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(`${user.firstName}`.trim() || 'Anonymous');
    }

    const updateCartCount = () => {
      setCartItemsCount(getCartItemsCount());
    };

    updateCartCount();

    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const toggleSideBar = () => setIsSideBarOpen(!isSideBarOpen);

  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSideBar} className="focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-2xl font-bold">CloudMart</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center cursor-pointer">
              <User className="h-6 w-6 mr-2" />
              <span className="hidden md:inline">{userName}</span>
            </Link>
            <Link to="/cart" className="relative cursor-pointer">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <SideBar isOpen={isSideBarOpen} onClose={toggleSideBar} />
    </>
  );
};

export default Header;