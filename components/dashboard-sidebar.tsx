"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  CarFront,
  BadgeDollarSign,
  UsersRound,
  CircleUserRound,
  UserCog,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Cars", href: "/dashboard/cars", icon: CarFront },
  { name: "Staff", href: "/dashboard/staff", icon: UsersRound },
  { name: "Customers", href: "/dashboard/customers", icon: CircleUserRound },
  { name: "Sales", href: "/dashboard/sales", icon: BadgeDollarSign },
  { name: "Profile", href: "/dashboard/profile", icon: UserCog },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-black text-white flex flex-col">
      <div className="border-b border-neutral-800 p-6">
        <h2 className="text-2xl font-bold">carzz</h2>
      </div>
      <ul className="py-4 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white",
                  isActive && "bg-neutral-900 text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="border-t border-neutral-800 p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:bg-neutral-900 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </nav>
  )
}
