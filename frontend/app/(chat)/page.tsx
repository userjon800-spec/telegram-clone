"use client";
import { Loader2 } from "lucide-react";
import ContactList from "./components/contact-list";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import AddContact from "./components/add-contact";
import { useCurrentContact } from "@/hooks/use-current";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { emailSchema, messageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import TopChat from "./components/top-chat";
import Chat from "./components/chat";
import { useSession } from "next-auth/react";
import { IError, IMessage, IUser } from "@/types";
import { useRouter } from "next/navigation";
import { useLoading } from "@/hooks/use.loading";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";
import { CONST, SOUNDS } from "@/lib/constants";
import { axiosClient } from "@/http/axios";
import { io } from "socket.io-client";
const Page: FC<GetSocketType> = ({
  deletedMessage,
  filteredMessages,
  message,
  newMessage,
  receiver,
  sender,
  updatedMessage,
}) => {
  const { data: session } = useSession();
  const { currentContact } = useCurrentContact();
  const socket = useRef<ReturnType<typeof io> | null>(null);
  const [contacts, setContacts] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { setCreating, setLoading, isLoading, setLoadMessages } = useLoading();
  const token = session?.accessToken;
  const router = useRouter();
  const { setOnlineUsers } = useAuth();
  const { playSound } = useAudio();
  const getMessages = async () => {
    setLoadMessages(true);
    try {
      const { data } = await axiosClient.get<{ messages: IMessage[] }>(
        `/api/user/messages/${currentContact?._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(data.messages);
    } catch (error) {
      toast.error("Cannot fetch messages");
    } finally {
      setLoadMessages(false);
    }
  };
  const getContacts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/user/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(data.contacts);
    } catch (error) {
      toast.error("Cannot fetch contacts");
    } finally {
      setLoading(false);
    }
  };
  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      image: "",
      text: "",
    },
  });
  useEffect(() => {
    // @ts-ignore
    if (session?.user.id) {
      socket.current?.emit("addOnlineUser", session.user);
      socket.current?.on(
        "getOnlineUsers",
        (data: { socketId: string; user: IUser }[]) => {
          setOnlineUsers(data.map((d) => d.user));
        },
      );
      getContacts();
    }
  }, [session?.user]);
  useEffect(() => {
    router.replace("/");
    socket.current = io("http://localhost:8000");
  }, []);
  useEffect(() => {
    if (session?.user) {
      socket.current?.on("getCreateUser", (user) => {
        console.log("Created by ", user);
        setContacts((prev) => {
          const exist = prev.some((c) => c._id === user._id);
          return exist ? prev : [...prev, user];
        });
      });
      socket.current?.on(
        "getMessage",
        ({ newMessage, sender, receiver }: GetSocketType) => {
          setMessages((prew) => {
            const exist = prew.some((m) => m._id === newMessage._id);
            return exist ? prew : [...prew, newMessage];
          });
          toast.success(
            `New message ${sender.email.split("@")[0]} sent you a message`,
          );
          if (!receiver.muted) {
            playSound(receiver.notificationSound || SOUNDS[0].value);
          }
        },
      );
    }
  }, [session?.user, socket]);
  useEffect(() => {
    if (currentContact?._id) {
      getMessages();
    }
  }, [currentContact]);
  async function onCreateContact(values: z.infer<typeof emailSchema>) {
    setCreating(true);
    try {
      const { data } = await axiosClient.post<{ contact: IUser }>(
        "/api/user/contact",
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setContacts((prev) => [...prev, data.contact]);
      socket.current?.emit("createContact", {
        currentUser: session?.user,
        receiver: data.contact,
      });
      toast.success("Contact added successfully");
      contactForm.reset();
    } catch (error) {
      if ((error as IError).response?.data?.message) {
        return toast((error as IError).response.data.message);
      }
      return toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }
  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
  };
  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    try {
      const { data } = await axiosClient.post<GetSocketType>(
        "/api//user/message",
        { ...values, receiver: currentContact?._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      socket.current?.emit("sendMessage", {
        newMessage: data.newMessage,
        receiver: data.receiver,
        sender: data.sender,
      });
      setMessages((prev) => [...prev, data.newMessage]);
      messageForm.reset();
    } catch {
      toast.error("Cannot send message");
    } finally {
      setCreating(false);
    }
  };
  const onEditMessage = async (messageId: string, text: string) => {
    try {
    } catch (error) {
      toast.error("Cannot edit message");
    }
  };
  const onReadMessages = async () => {
    try {
    } catch (error) {
      toast.error("Cannot mark messages as read");
    }
  };
  const onReaction = async (reaction: string, messageId: string) => {
    try {
    } catch (error) {
      toast.error("Cannot react to message");
    }
  };
  const onDeleteMessage = async (messageId: string) => {
    try {
    } catch (error) {
      toast.error("Cannot delete message");
    }
  };
  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {};
  return (
    <>
      <div className="w-80 h-screen border-r fixed inset-0 z-50">
        {isLoading && (
          <div className="w-full h-[95vh] flex justify-center items-center">
            <Loader2 size={50} className="animate-spin" />
          </div>
        )}
        <ContactList contacts={contacts} />
      </div>
      <div className="max-md:pl-16 pl-80 w-full">
        {!currentContact?._id && (
          <AddContact
            contactForm={contactForm}
            onCreateContact={onCreateContact}
          />
        )}
        {currentContact?._id && (
          <div className="w-full relative">
            <TopChat messages={messages} />
            <Chat
              messageForm={messageForm}
              onSendMessage={onSendMessage}
              // onSubmitMessage={onSubmitMessage}
              messages={messages}
              // onReadMessages={onReadMessages}
              // onReaction={onReaction}
              // onDeleteMessage={onDeleteMessage}
              // onTyping={onTyping}
            />
          </div>
        )}
      </div>
    </>
  );
};
export default Page;
interface GetSocketType {
  receiver: IUser;
  sender: IUser;
  newMessage: IMessage;
  updatedMessage: IMessage;
  deletedMessage: IMessage;
  filteredMessages: IMessage[];
  message: string;
}