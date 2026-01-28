import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
const f = createUploadthing();
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.accessToken || !session.user?.email) throw new UploadThingError("Unauthorized");
      return {
        user: session.user,
        accessToken: session.accessToken,
      };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;