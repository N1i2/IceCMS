import { toast } from "sonner";

 export const sendSuccess = (successMessage: string, descriptionMessage: string) => {
    toast.success(successMessage, {
      description: descriptionMessage,
      style:{
        color: "#0a0",
      },
      descriptionClassName: "text-green-500",
    },);
  };

export const sendError = (errorMessage: string, descriptionMessage: string) => {
  toast.warning(errorMessage, {
    description: descriptionMessage,
    style: {
      color: "#a00",
    }
  });
};
