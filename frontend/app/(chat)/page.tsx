"use client";
import { Loader2 } from "lucide-react";
import ContactList from "./components/contact-list";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import AddContact from "./components/add-contact";
import { useCurrentContact } from "@/hooks/use-current";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { emailSchema, messageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import TopChat from "./components/top-chat";
import Chat from "./components/chat";
import { useSession } from "next-auth/react";
import { IUser } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
const Page = () => {
  const { currentContact } = useCurrentContact();
  const router = useRouter();
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
    router.replace("/");
  }, []);
  function onCreateContact(values: z.infer<typeof emailSchema>) {
    console.log(values);
  }
  const onSendMessage = (values: z.infer<typeof messageSchema>) => {
    // API call to send message
    console.log(values);
  };
  return (
    <>
      <div className="w-80 h-screen border-r fixed inset-0 z-50">
        {/* <div className='w-full h-[95vh] flex justify-center items-center'>
					<Loader2 size={50} className='animate-spin' />
				</div> */}
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
            <TopChat
            //  messages={messages}
            />
            <Chat
              messageForm={messageForm}
              onSendMessage={onSendMessage}
              // onSubmitMessage={onSubmitMessage}
              // messages={messages}
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
const contacts = [
  {
    email: "john@gmail.com",
    _id: "1",
    avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis repellat blanditiis hic reiciendis quibusdam voluptatem necessitatibus, minus sint maxime iste impedit cupiditate ab provident doloremque sed dicta, molestias nemo cum.",
  },
  { email: "amile@gmail.com", _id: "2",avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis repellat blanditiis hic reiciendis quibusdam voluptatem necessitatibus, minus sint maxime iste impedit cupiditate ab provident doloremque sed dicta, molestias nemo cum.", },
  { email: "faris@gmail.com", _id: "3",avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis repellat blanditiis hic reiciendis quibusdam voluptatem necessitatibus, minus sint maxime iste impedit cupiditate ab provident doloremque sed dicta, molestias nemo cum.", },
  { email: "abdo@gmail.com", _id: "4",avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis repellat blanditiis hic reiciendis quibusdam voluptatem necessitatibus, minus sint maxime iste impedit cupiditate ab provident doloremque sed dicta, molestias nemo cum.", },
  { email: "billi@gmail.com", _id: "5",avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis repellat blanditiis hic reiciendis quibusdam voluptatem necessitatibus, minus sint maxime iste impedit cupiditate ab provident doloremque sed dicta, molestias nemo cum.", },
];
export default Page;
