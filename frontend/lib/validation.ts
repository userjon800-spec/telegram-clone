"use client";
import { z } from "zod";
export const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address. Please try again. " }),
});
export const otpSchema = z
  .object({
    otp: z
      .string()
      .min(6, { message: "Your one-time password must be 6 characters" }),
  })
  .merge(emailSchema);
export const oldEmailSchema = z
  .object({
    oldEmail: z
      .string()
      .email({ message: "Invalid email address, please check and try again." }),
  })
  .merge(emailSchema);
export const messageSchema = z
  .object({
    text: z.string().default(""),
    image: z.string().default(""),
  })
  .refine((data) => data.text.trim().length > 0 || data.image, {
    message: "Message must have text or image",
  });
export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().optional(),
  bio: z.string().optional(),
});
export const confirmTextSchema = z
  .object({ confirmText: z.string() })
  .refine((data) => data.confirmText === "DELETE", {
    message: "You must type DELETE to confirm.",
    path: ["confirmText"],
  });