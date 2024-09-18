import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Inter} from 'next/font/google';
import Navbar from "./components/Navbar";
import clsx from "clsx";
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
    <html lang="en">
      <body
        className={clsx(inter.className, 'bg-slate-700')}
      >
      <Navbar />
      <main className=" h-screen p-16">
        {children}
        </main>
      </body>
    </html>
  );
}
