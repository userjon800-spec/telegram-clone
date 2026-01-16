"use client";
import { Loader2 } from "lucide-react";
import ContactList from "./components/contact-list";
import AddContact from "./components/add-contact";
import Chat from "./components/chat";
import TopChat from "./components/top-chat";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentContact } from "@/hooks/use-current";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@/lib/validation";
import z from "zod";
const Page = () => {
  const { currentContact } = useCurrentContact();
  const router = useRouter();
  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  useEffect(() => {
    router.replace("/");
  }, []);
  function onCreateContact(values: z.infer<typeof emailSchema>) {
    console.log(values);
  }
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
            // messageForm={messageForm}
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
  },
  { email: "amile@gmail.com", _id: "2" },
  { email: "faris@gmail.com", _id: "3" },
  { email: "abdo@gmail.com", _id: "4" },
  { email: "billi@gmail.com", _id: "5" },
];
export default Page;