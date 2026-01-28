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
import { messageSchema } from "@/lib/validation";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useLoading } from "@/hooks/use.loading";
import { UploadDropzone } from "@uploadthing/react";
import { IMessage } from "@/types";
interface Props {
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>;
  onSendMessage: (values: z.infer<typeof messageSchema>) => void;
  messages: IMessage[];
}
const Chat: FC<Props> = ({ messageForm, onSendMessage, messages }) => {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { loadMessages } = useLoading();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLFormElement | null>(null);
  const { editMessage, setEditedMessage, currentContact } = useCurrentContact();
  const { data: session } = useSession();
  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;
    const text = messageForm.getValues("text");
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    messageForm.setValue("text", newText);
    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };
  return (
    <div className="flex flex-col justify-end z-40 min-h-[92vh] sidebar-custom-scrollbar overflow-y-scroll">
      {loadMessages && <ChatLoading />}
      {/* {filteredMessages.map((message, index) => (
				<MessageCard key={index} message={message} onReaction={onReaction} onDeleteMessage={onDeleteMessage} />
			))} */}{" "}
      {/* //!! Keyinroq ishlat */}
      {messages.map((message, index) => (
        <MessageCard key={index} message={message} />
      ))}
      {messages.length === 0 && (
        <div className="w-full h-[88vh] flex items-center justify-center">
          <div
            className="text-[100px] cursor-pointer"
            // onClick={() => onSubmitMessage({ text: '✋' })}
          >
            ✋
          </div>
        </div>
      )}
      <Form {...messageForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            messageForm.handleSubmit(onSendMessage)();
          }}  
          //!! buni keyinroq ishlatma
          // onSubmit={messageForm.handleSubmit(onSubmitMessage)}
          className="w-full flex relative"
          ref={scrollRef}
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size={"icon"} type="button" variant={"secondary"}>
                <Paperclip />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle />
              </DialogHeader>
              {/* <UploadDropzone
                endpoint={"imageUploader"}
                onClientUploadComplete={(res) => {
                  onSubmitMessage({ text: "", image: res[0].url });
                  setOpen(false);
                }}
                config={{ appendOnPaste: true, mode: "auto" }}
              /> */}
            </DialogContent>
          </Dialog>
          <FormField
            control={messageForm.control}
            name="text"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="bg-secondary border-l border-l-muted-foreground border-r border-r-muted-foreground h-9"
                    placeholder="Type a message"
                    value={field.value}
                    onBlur={() => field.onBlur()}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // onTyping(e);
                      if (e.target.value === "") setEditedMessage(null);
                    }}
                    ref={inputRef}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" type="button" variant="secondary">
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none rounded-md absolute right-6 bottom-0">
              <Picker
                // data={emojies}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onEmojiSelect={(emoji: { native: string }) =>
                  handleEmojiSelect(emoji.native)
                }
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" size={"icon"}>
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default Chat;
