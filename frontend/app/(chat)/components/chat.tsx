import MessageCard from "@/components/cards/message.card";
import ChatLoading from "@/components/loadings/chat.loading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile } from "lucide-react";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { useCurrentContact } from "@/hooks/use-current";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
const Chat = () => {
  return (
    <div className="flex flex-col justify-end z-40 min-h-[92vh]">
      {/* <ChatLoading /> */}
      <MessageCard />
    </div>
  );
};
export default Chat;