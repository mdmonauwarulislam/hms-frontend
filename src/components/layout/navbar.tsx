"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { UserRole } from "@/components/lib/types"
import { Building2, LogOut, User, Users, Pill } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
    },
    {
      name: "Hospitals",
      href: "/hospitals",
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN],
    },
    {
      name: "Doctors",
      href: "/doctors",
      icon: Users,
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN],
    },
    {
      name: "Patients",
      href: "/patients",
      icon: User,
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
    },
    {
      name: "Prescriptions",
      href: "/prescriptions",
      icon: Pill,
      roles: [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role))

  return (
    <nav className="bg-white border-b border-emerald-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Building2 className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-emerald-900">HospitalMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-slate-500">{user.role.replace("_", " ")}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
