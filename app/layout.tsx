import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { SocketProvider } from "@/components/providers/socket-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Qwisky - Real-time Chat Application",
  description: "Connect instantly, chat seamlessly with Qwisky's powerful communication platform",
  keywords: ["chat", "messaging", "real-time", "communication", "qwisky"],
  authors: [{ name: "Qwisky Team" }],
  creator: "Qwisky",
  publisher: "Qwisky",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthSessionProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthSessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
