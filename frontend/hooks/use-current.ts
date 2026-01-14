import { IUser } from "@/types";
import React from "react";
const useCurrentContact = () => {
  const [currentContact, setCurrentContact] = React.useState<IUser | null>(
    null
  );
  return { currentContact, setCurrentContact };
};
export { useCurrentContact };