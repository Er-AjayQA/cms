"use client";

import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return (
    <ToastContainer
      autoClose={3200}
      closeButton={false}
      draggable
      hideProgressBar={false}
      newestOnTop
      pauseOnFocusLoss={false}
      pauseOnHover
      position="top-right"
      theme="light"
      toastClassName="cms-toast"
      bodyClassName="cms-toast-body"
      progressClassName="cms-toast-progress"
    />
  );
}
