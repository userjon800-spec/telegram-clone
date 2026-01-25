import { IUser } from "@/types";
import { create } from "zustand";
type Store = {
  isCreating: boolean;
  setCreating: (isCreating: boolean) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  loadMessages: boolean;
  setLoadMessages: (loadMessages: boolean) => void;
  typing: { sender: IUser | null; message: string };
  setTyping: (typing: { sender: IUser | null; message: string }) => void;
};
export const useLoading = create<Store>()((set) => ({
  isCreating: false,
  setCreating(isCreating) {
    return set({ isCreating });
  },
  isLoading: false,
  setLoading(isLoading) {
    return set({ isLoading });
  },
  loadMessages: false,
  setLoadMessages(loadMessages) {
    return set({ loadMessages });
  },
  typing: { sender: null, message: "" },
  setTyping(typing) {
    return set({ typing });
  },
}));