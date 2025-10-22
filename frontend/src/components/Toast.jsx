import { useState, useEffect, useCallback } from 'react';
import './Toast.css';

let toastId = 0;

const Toast = ({ toast, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  return (
    <div className={`toast ${toast.type} ${isClosing ? 'closing' : ''}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        ×
      </button>
      <div
        className="toast-progress"
        style={{ animationDuration: `${toast.duration || 3000}ms` }}
      />
    </div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook để sử dụng toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = toastId++;
    const toast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration || 3000,
    };

    setToasts((prev) => [...prev, toast]);
  }, []);

  const success = useCallback((message, title = 'Thành công') => {
    showToast(message, { type: 'success', title });
  }, [showToast]);

  const error = useCallback((message, title = 'Lỗi') => {
    showToast(message, { type: 'error', title });
  }, [showToast]);

  const warning = useCallback((message, title = 'Cảnh báo') => {
    showToast(message, { type: 'warning', title });
  }, [showToast]);

  const info = useCallback((message, title = 'Thông tin') => {
    showToast(message, { type: 'info', title });
  }, [showToast]);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    closeToast,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={closeToast} />,
  };
};

export default Toast;

