"use client";
import NoSSR from "react-no-ssr"
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>
    <NoSSR>
      {children}
    </NoSSR>
  </NextThemesProvider>;
}