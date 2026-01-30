"use client";
import { Loader2 } from "lucide-react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ContactList from "./components/contact-list";
import AddContact from "./components/add-contact";
import TopChat from "./components/top-chat";
import Chat from "./components/chat";
import { useCurrentContact } from "@/hooks/use-current";
import { useLoading } from "@/hooks/use.loading";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";
import { emailSchema, messageSchema } from "@/lib/validation";
import { axiosClient } from "@/http/axios";
import { socket } from "@/lib/socket";
import { IUser, IMessage, IError } from "@/types";
import { CONST, SOUNDS } from "@/lib/constants";
import { on } from "events";
import { set } from "mongoose";
const Page: FC = () => {
  const { data: session } = useSession();
  const { currentContact, editMessage, setEditedMessage } = useCurrentContact();
  const { setLoading, isLoading, setCreating, setLoadMessages, setTyping } =
    useLoading();
  const { setOnlineUsers, onlineUsers } = useAuth();
  const { playSound } = useAudio();
  const token = session?.accessToken;
  const serachParams = useSearchParams();
  const CONTACT_ID = serachParams.get("chat");
  const [contacts, setContacts] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema) as unknown as Resolver<
      z.infer<typeof messageSchema>
    >,
    defaultValues: { text: "", image: "" },
  });
  useEffect(() => {
    if (!session?.accessToken) return;
    if (!socket.connected) {
      socket.auth = { token: session.accessToken };
      socket.connect();
    }
    socket.emit("addOnlineUser", session.user);
    return () => {
      socket.off();
    };
  }, [session?.user._id]);
  useEffect(() => {
    const handleOnlineUsers = (users: any[]) => {
      setOnlineUsers(users.map((u) => u.user));
    };
    socket.on("getOnlineUsers", handleOnlineUsers);
    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, []);
  useEffect(() => {
    const onCreateUser = (user: IUser) => {
      setContacts((prev) =>
        prev.some((c) => c._id === user._id) ? prev : [...prev, user],
      );
    };
    const onNewMessage = ({ newMessage, sender, receiver }: GetSocketType) => {
      setTyping({ sender: null, message: "" });
      if (CONTACT_ID === sender._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
      setContacts((prev) => {
        return prev.map((contact) => {
          if (contact._id === sender._id) {
            return {
              ...contact,
              lastMessage: {
                ...newMessage,
                status:
                  CONTACT_ID === sender._id ? CONST.READ : newMessage.status,
              },
            };
          }
          return contact;
        });
      });
      if (!receiver.muted) {
        playSound(receiver.notificationSound);
      }
    };
    const readMessagesHandler = (messages: IMessage[]) => {
      setMessages((prev) =>
        prev.map((item) => {
          const message = messages.find((msg) => msg._id === item._id);
          return message ? { ...item, status: CONST.READ } : item;
        }),
      );
    };
    const updatedMessage = ({ updatedMessage, sender }: GetSocketType) => {
      setTyping({ sender: null, message: "" });
      setMessages((prev) =>
        prev.map((item) =>
          item._id === updatedMessage._id
            ? {
                ...item,
                reaction: updatedMessage.reaction,
                text: updatedMessage.text,
              }
            : item,
        ),
      );
      setContacts((prev) =>
        prev.map((item) =>
          item._id === sender._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === updatedMessage._id
                    ? updatedMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
    };
    const getDeleteMessage = ({
      deletedMessage,
      sender,
      filteredMessages,
    }: GetSocketType) => {
      setMessages((prev) =>
        prev.filter((item) => item._id !== deletedMessage._id),
      );
      const lastMessage = filteredMessages.length
        ? filteredMessages[filteredMessages.length - 1]
        : null;
      setContacts((prev) =>
        prev.map((item) =>
          item._id === sender?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === deletedMessage._id
                    ? lastMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
    };
    socket.on("getCreateUser", onCreateUser);
    socket.on("getNewMessage", onNewMessage);
    socket.on("getReadMessages", readMessagesHandler);
    socket.on("getUpdatedMessage", updatedMessage);
    socket.on("getDeletedMessage", getDeleteMessage);
    socket.on("getTyping", ({ message, sender }: GetSocketType) => {
      if (CONTACT_ID === sender._id) {
        setTyping({ sender, message });
      }
    });
    return () => {
      socket.off("getCreateUser", onCreateUser);
      socket.off("getNewMessage", onNewMessage);
      socket.off("getReadMessages", readMessagesHandler);
      socket.off("getUpdatedMessage", updatedMessage);
      socket.off("getDeletedMessage", getDeleteMessage);
    };
  }, []);
  const getContacts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/user/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(data.contacts);
    } catch {
      toast.error("Cannot fetch contacts");
    } finally {
      setLoading(false);
    }
  };
  const getMessages = async () => {
    if (!currentContact?._id) return;
    setLoadMessages(true);
    try {
      const { data } = await axiosClient.get(
        `/api/user/messages/${currentContact._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(data.messages);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact._id && item.lastMessage
            ? {
                ...item,
                lastMessage: { ...item.lastMessage, status: CONST.READ },
              }
            : item,
        ),
      );
    } catch {
      toast.error("Cannot fetch messages");
    } finally {
      setLoadMessages(false);
    }
  };
  useEffect(() => {
    if (token) getContacts();
  }, [token]);
  useEffect(() => {
    getMessages();
  }, [currentContact?._id]);
  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    setCreating(true);
    try {
      const { data } = await axiosClient.post("/api/user/contact", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts((prev) => [...prev, data.contact]);
      socket.emit("createContact", {
        currentUser: session?.user,
        receiver: data.contact,
      });
      contactForm.reset();
    } catch (error) {
      toast.error((error as IError)?.response?.data?.message || "Error");
    } finally {
      setCreating(false);
    }
  };
  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    try {
      const { data } = await axiosClient.post(
        "/api/user/message",
        { ...values, receiver: currentContact?._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      socket.emit("sendMessage", {
        newMessage: data.newMessage,
        receiver: data.receiver,
        sender: data.sender,
      });
      setMessages((prev) => [...prev, data.newMessage]);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: {
                  ...data.newMessage,
                  status: CONST.READ,
                } as IMessage,
              }
            : item,
        ),
      );
      messageForm.reset();
    } catch {
      toast.error("Cannot send message");
    } finally {
      setCreating(false);
    }
  };
  const onReadMessages = async () => {
    const receiverMessages = messages.filter(
      (message) =>
        message.receiver._id === session?.user._id &&
        message.status !== CONST.READ,
    );
    if (receiverMessages.length === 0) return;
    try {
      const { data } = await axiosClient.post<{ messages: IMessage[] }>(
        "/api/user/message-read",
        { messages: receiverMessages },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      socket.emit("readMessages", {
        receiver: currentContact,
        messages: data.messages,
      });
      setMessages((prev) =>
        prev.map((item) => {
          const message = data.messages.find((msg) => msg._id === item._id);
          return message ? { ...item, status: CONST.READ } : item;
        }),
      );
    } catch {
      toast.error("Cannot mark messages as read");
    }
  };
  const onReaction = async (reaction: string, messageId: string) => {
    try {
      const { data } = await axiosClient.post<{ updateMessage: IMessage }>(
        "/api/user/reaction",
        { reaction, messageId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) =>
        prev.map((Item) =>
          Item._id === data.updateMessage._id
            ? { ...Item, reaction: data.updateMessage.reaction }
            : Item,
        ),
      );
      socket.emit("updateMessage", {
        updatedMessage: data.updateMessage,
        receiver: currentContact,
        sender: session?.user,
      });
    } catch {
      toast.error("Cannot react to message");
    }
  };
  const onDeleteMessage = async (messageId: string) => {
    try {
      const { data } = await axiosClient.delete<{ deletedMessage: IMessage }>(
        `/api/user/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const filteredMessages = messages.filter(
        (msg) => msg._id !== data.deletedMessage._id,
      );
      const lastMessage = filteredMessages.length
        ? filteredMessages[filteredMessages.length - 1]
        : null;
      setMessages(filteredMessages);
      socket.emit("deleteMessage", {
        deletedMessage: data.deletedMessage,
        sender: session?.user,
        receiver: currentContact,
        filteredMessages,
      });
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === messageId
                    ? lastMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
    } catch {
      toast.error("Cannot delete message");
    }
  };
  const onEditMessage = async (messageId: string, text: string) => {
    try {
      const { data } = await axiosClient.put<{ updateMessage: IMessage }>(
        `/api/user/message/${messageId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.updateMessage._id
            ? { ...item, text: data.updateMessage.text }
            : item,
        ),
      );
      socket.emit("updateMessage", {
        updatedMessage: data.updateMessage,
        receiver: currentContact,
        sender: session?.user,
      });
      messageForm.reset();
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage:
                  item.lastMessage?._id === messageId
                    ? data.updateMessage
                    : item.lastMessage,
              }
            : item,
        ),
      );
      setEditedMessage(null);
    } catch {
      toast.error("Cannot edit message");
    }
  };
  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    if (editMessage?._id) {
      onEditMessage(editMessage._id, values.text);
    } else {
      onSendMessage(values);
    }
  };
  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {
    socket.emit("typing", {
      sender: session?.user,
      receiver: currentContact,
      message: e.target.value,
    });
  };
  return (
    <>
      <div className="w-80 h-screen border-r fixed inset-0 z-50">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <ContactList contacts={contacts} />
        )}
      </div>
      <div className="pl-80 w-full">
        {!currentContact?._id && (
          <AddContact
            contactForm={contactForm}
            onCreateContact={onCreateContact}
          />
        )}
        {currentContact?._id && (
          <>
            <TopChat messages={messages} />
            <Chat
              messageForm={messageForm}
              onSubmitMessage={onSubmitMessage}
              messages={messages}
              onReadMessages={onReadMessages}
              onReaction={onReaction}
              onDeleteMessage={onDeleteMessage}
              onTyping={onTyping}
            />
          </>
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
