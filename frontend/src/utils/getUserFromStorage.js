// src/utils/getUserFromStorage.js
export const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined') return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('❌ Invalid JSON in localStorage "user":', error);
    return null;
  }
};
