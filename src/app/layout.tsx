import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StacksProvider } from "@/components/providers/StacksProvider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvoiceVault",
  description: "Fractional, yield-bearing escrow on Stacks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${plusJakarta.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-[#ff4500]/30 selection:text-[#ff4500]`}>
        <StacksProvider>
          {children}
          <Toaster />
        </StacksProvider>
      </body>
    </html>
  );
}
