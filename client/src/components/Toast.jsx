import { useEffect } from 'react';
import './Toast.css';

let toastId = 0;

export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  const id = toastId++;
  
  toast.className = `toast toast-${type} toast-enter`;
  toast.innerHTML = `
    <div class="toast-icon">${getIcon(type)}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('toast-show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
};

const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  return icons[type] || icons.success;
};

const Toast = () => {
  useEffect(() => {
    if (!document.getElementById('toast-container')) {
      createToastContainer();
    }
  }, []);
  
  return null;
};

export default Toast;
