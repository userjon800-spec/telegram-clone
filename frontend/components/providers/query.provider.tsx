"use client";
import { ChildProps, IError } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";
import { toast } from "sonner";
const onErrors = (error: Error|IError) => {
  if ((error as IError).response?.data?.message) {
    return toast.error((error as IError).response.data.message);
  }
  return toast.error("Something went wrong");
};
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {onError: onErrors},
  },
});
const QueryProvider: FC<ChildProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
export default QueryProvider;