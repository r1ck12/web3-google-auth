"use client"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Inter } from "next/font/google"
import { ThemeUIProvider } from "theme-ui"
import { theme } from "./theme/theme"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={60}>
      <ThemeUIProvider theme={theme}>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </ThemeUIProvider>
    </SessionProvider>
  )
}
