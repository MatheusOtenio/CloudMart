// utils/userUtils.js

const USER_KEY = 'cloudmart_user';

export const initializeUser = () => {
  const existingUser = localStorage.getItem(USER_KEY);
  if (!existingUser) {
    const randomNumber = Math.floor(Math.random() * 10000);
    const newUser = {
      email: `user@example.com`,
      firstName: 'Anonymous',
      lastName: `User${randomNumber}`,
      phone: ''
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  }
  return JSON.parse(existingUser);
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const updateUser = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
};