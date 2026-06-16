import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingBlobs from "@/components/FloatingBlobs";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "MITAOE Student Clubs Portal",
  description: "Explore the vibrant campus life at MIT Academy of Engineering, Alandi, Pune. Discover and join our technical, cultural, and recreational clubs.",
  keywords: "MITAOE, Student Clubs, MIT Academy of Engineering, Pune, College Clubs, Technical Clubs, Cultural Clubs, Campus Life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased bg-[#030014] text-gray-200">
        <LenisProvider>
          <FloatingBlobs />
          <Header />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}

