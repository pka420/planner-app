import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: 'ABC Planner',
  description: 'Simple planner for V|| semester 2025',
  generator: 'github.com/pka420',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
<ThemeProvider attribute="class" defaultTheme="light" >
        {children}
        <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
