"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Radio,
  Gauge,
  Users,
  MessageSquare,
  Vote,
  Wrench,
  Hammer,
  Car,
  Route,
  ClipboardList,
  BarChart3,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Propriétaires", href: "/proprietaires", icon: Building },
  { name: "Arrondissements", href: "/arrondissements", icon: Building2 },
  { name: "Capteurs", href: "/capteurs", icon: Radio },
  { name: "Mesures", href: "/mesures", icon: Gauge },
  { name: "Techniciens", href: "/techniciens", icon: Wrench },
  { name: "Interventions", href: "/interventions", icon: Hammer },
  { name: "Citoyens", href: "/citoyens", icon: Users },
  { name: "Consultations", href: "/consultations", icon: MessageSquare },
  { name: "Participations", href: "/participations", icon: Vote },
  { name: "Véhicules", href: "/vehicules", icon: Car },
  { name: "Trajets", href: "/trajets", icon: Route },
  { name: "Effectués", href: "/effectues", icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">SmartCity</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
