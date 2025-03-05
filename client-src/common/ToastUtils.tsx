import { toast, ToastOptions } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Shows a toast notification with the specified message and type
 * @param message - The message to display in the toast
 * @param type - The type of toast (success, error, info, warning)
 * @param autoClose - Duration in milliseconds before the toast auto-closes
 */
export function showToast(
  message: string,
  type: ToastType,
  autoClose: number = 800
): void {
  const options: ToastOptions = {
    position: "top-center",
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'info':
      toast.info(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
  }
}