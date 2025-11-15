import { message } from "antd";
import { useEffect } from "react";

export const useToast = () => {
  useEffect(() => {
    message.config({
      duration: 3,
      maxCount: 3,
      getContainer: () => document.body,
    });
  }, []);

  const showSuccess = (customMessage = "") => {
    message.success(customMessage);
  };

  const showError = (customMessage = "") => {
    message.error(customMessage);
  };

  const showWarning = (customMessage = "") => {
    message.warning(customMessage);
  };

  return { showSuccess, showError, showWarning };
};
