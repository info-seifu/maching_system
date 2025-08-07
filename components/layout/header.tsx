"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Frame, LogOut, User, TestTube } from 'lucide-react'

export function Header() {
  const { user, logout, isGuest } = useAuth()

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold sm:text-base mr-4">
        <Frame className="w-6 h-6" />
        <span>学生企業マッチング</span>
        {isGuest && (
          <Badge variant="secondary" className="ml-2">
            <TestTube className="w-3 h-3 mr-1" />
            ゲストモード
          </Badge>
        )}
      </Link>
      
      {user && (
        <nav className="hidden font-medium sm:flex flex-row items-center gap-5 text-sm lg:gap-6">
          {user.role === 'ADMIN' && (
            <>
              <Link href="/dashboard" className="font-bold">
                ダッシュボード
              </Link>
              <Link href="/students" className="text-muted-foreground hover:text-foreground">
                学生管理
              </Link>
              <Link href="/companies" className="text-muted-foreground hover:text-foreground">
                企業管理
              </Link>
              <Link href="/matches" className="text-muted-foreground hover:text-foreground">
                マッチング
              </Link>
              <Link href="/reports" className="text-muted-foreground hover:text-foreground">
                レポート
              </Link>
            </>
          )}
          {user.role === 'STUDENT' && (
            <>
              <Link href="/student/profile" className="font-bold">
                マイページ
              </Link>
              <Link href="/student/matches" className="text-muted-foreground hover:text-foreground">
                マッチング結果
              </Link>
            </>
          )}
          {user.role === 'COMPANY' && (
            <>
              <Link href="/company/profile" className="font-bold">
                企業ページ
              </Link>
              <Link href="/company/positions" className="text-muted-foreground hover:text-foreground">
                募集ポジション
              </Link>
            </>
          )}
        </nav>
      )}

      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-auto">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">
                {user.email}
                {isGuest && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    ゲスト
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-muted-foreground">
                {user.role}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button>ログイン</Button>
          </Link>
        )}
      </div>
    </header>
  )
}
