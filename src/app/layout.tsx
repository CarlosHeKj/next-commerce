import type { Metadata } from "next";
import "./globals.css";
import {Inter} from 'next/font/google';
import Navbar from "./components/Navbar";
import clsx from "clsx";
import { ClerkProvider } from "@clerk/nextjs";
import Hydrate from "./components/Hydrats";


import { ptBR } from '@clerk/localizations'
const inter = Inter({subsets: ['latin']});


export const metadata: Metadata = {
  title: "Next E-Commerce 14",
  description: "Next E-Commerce utilizando a versão 14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
    <html lang="en">
      <body
        className={clsx(inter.className, 'bg-slate-700')}
      >
        <Hydrate>
      <Navbar />
      <main className=" h-screen p-16">
        {children}
        </main>
        </Hydrate>
      </body>
    </html>
    </ClerkProvider>
  );
}
