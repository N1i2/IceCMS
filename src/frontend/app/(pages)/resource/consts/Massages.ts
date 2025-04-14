import { toast } from "sonner";

 export const sendSuccess = (successMessage: string, descriptionMessage: string) => {
    toast.success(successMessage, {
      description: descriptionMessage,
    });
  };

 export const sendError = (errorMessage: string, descriptionMessage: string) => {
    toast.warning(errorMessage, {
      description: descriptionMessage,
    });
  };
