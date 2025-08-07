"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { signIn, signInAsGuest, isDevelopment } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Frame, User, Shield, Building2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await signIn(email, password)
      if (user) {
        login(user)
        toast({
          title: "ログイン成功",
          description: "ダッシュボードにリダイレクトします。",
        })
        
        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/dashboard')
        } else if (user.role === 'STUDENT') {
          router.push('/student/profile')
        } else if (user.role === 'COMPANY') {
          router.push('/company/profile')
        } else {
          router.push('/')
        }
      } else {
        toast({
          title: "ログイン失敗",
          description: "メールアドレスまたはパスワードが正しくありません。",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログイン中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async (guestType: 'admin' | 'student' | 'company') => {
    setGuestLoading(guestType)

    try {
      const user = await signInAsGuest(guestType)
      if (user) {
        login(user)
        toast({
          title: "ゲストログイン成功",
          description: `${guestType === 'admin' ? '管理者' : guestType === 'student' ? '学生' : '企業'}としてログインしました。`,
        })
        
        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/dashboard')
        } else if (user.role === 'STUDENT') {
          router.push('/student/profile')
        } else if (user.role === 'COMPANY') {
          router.push('/company/profile')
        } else {
          router.push('/')
        }
      } else {
        toast({
          title: "ゲストログイン失敗",
          description: "ゲストログインに失敗しました。",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ゲストログイン中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setGuestLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Frame className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">学生企業マッチング</CardTitle>
          <CardDescription>
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="パスワードを入力"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          {/* Guest Mode Section - Only show in development */}
          {isDevelopment() && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    開発環境専用
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  ゲストモードでログイン（認証不要）
                </p>
                
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleGuestLogin('admin')}
                    disabled={guestLoading !== null}
                    className="w-full justify-start"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {guestLoading === 'admin' ? 'ログイン中...' : '管理者としてログイン'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleGuestLogin('student')}
                    disabled={guestLoading !== null}
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {guestLoading === 'student' ? 'ログイン中...' : '学生としてログイン'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleGuestLogin('company')}
                    disabled={guestLoading !== null}
                    className="w-full justify-start"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {guestLoading === 'company' ? 'ログイン中...' : '企業としてログイン'}
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">通常ログイン用テストアカウント:</p>
            <div className="space-y-1">
              <p>指定ユーザー: user+1750772130206@example.com / RegularUser2024!@#</p>
              <p className="text-xs text-gray-500">※ Supabaseで事前にユーザー作成が必要です</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
