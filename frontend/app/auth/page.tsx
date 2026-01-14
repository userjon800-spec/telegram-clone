import { FaTelegram } from "react-icons/fa";
// import { ModeToggle } from '@/components/shared/mode-toggle'
import { getServerSession } from "next-auth";
// import { authOptions } from '@/lib/auth-options'
import { redirect } from "next/navigation";
import StateAuth from "./components/state";
import Social from "./components/social";
const Page = async () => {
  return (
    <div className="container max-w-md w-full h-screen flex justify-center items-center flex-col space-y-4 border">
      <FaTelegram size={120} className="text-blue-500" />
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-bold">Telegram</h1>
        {/* <ModeToggle /> */}
      </div>
      <StateAuth />
      <Social />
    </div>
  );
};
export default Page;
