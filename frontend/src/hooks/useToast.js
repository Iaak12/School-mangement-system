import { useState, useCallback } from 'react';

let toastId = 0;
let globalSetToasts = null;

export const toast = ({ title, description, variant = 'default', duration = 4000 }) => {
  if (globalSetToasts) {
    const id = ++toastId;
    globalSetToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    setTimeout(() => {
      globalSetToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  globalSetToasts = setToasts;

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toast, toasts, dismiss };
};
