"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, Building2, GraduationCap, Heart, LayoutDashboard, User, Briefcase, FileText, Zap } from 'lucide-react'

const adminNavItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/students', label: '学生管理', icon: GraduationCap },
  { href: '/companies', label: '企業管理', icon: Building2 },
  { href: '/matches', label: 'マッチング', icon: Heart },
  { href: '/admin/matching', label: 'マッチング実行', icon: Zap },
  { href: '/reports', label: 'レポート', icon: BarChart3 },
]

const studentNavItems = [
  { href: '/student/profile', label: 'マイページ', icon: User },
  { href: '/student/matches', label: 'マッチング結果', icon: Heart },
]

const companyNavItems = [
  { href: '/company/profile', label: '企業ページ', icon: Building2 },
  { href: '/company/positions', label: '募集ポジション', icon: Briefcase },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  let navItems = []
  if (user.role === 'ADMIN') navItems = adminNavItems
  else if (user.role === 'STUDENT') navItems = studentNavItems
  else if (user.role === 'COMPANY') navItems = companyNavItems

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
