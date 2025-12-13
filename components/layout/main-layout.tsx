"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { Toaster } from "@/components/ui/toaster"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
