// components/ui/ToastProvider.tsx
"use client";

import React, { createContext, useState } from "react";
import type { ToastProps } from "./Toast";

export interface CustomToast extends Omit<ToastProps, "title" | "description"> {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

interface ToastContextType {
  toasts: CustomToast[];
  addToast: (toast: Omit<CustomToast, "id">) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<CustomToast[]>([]);

  const addToast = (toast: Omit<CustomToast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
