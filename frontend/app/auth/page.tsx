import { FaTelegram } from "react-icons/fa";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StateAuth from "./components/state";
import Social from "./components/social";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { authOptions } from "@/lib/auth-options";
const Page = async () => {
  const session = await getServerSession(authOptions);
  if (session) return redirect("/");
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="container max-w-md w-full h-full flex justify-center items-center flex-col space-y-4">
        <FaTelegram size={120} className="text-blue-500" />
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">Telegram</h1>
          <ModeToggle />
        </div>
        <StateAuth />
        <Social />
      </div>
    </div>
  );
};
export default Page;