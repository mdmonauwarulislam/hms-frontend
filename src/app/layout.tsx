import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "A modern hospital management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <Providers>
          <main className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  )
}
