"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Frame, GraduationCap, Building2, Heart } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        router.push('/dashboard')
      } else if (user.role === 'STUDENT') {
        router.push('/student/profile')
      } else if (user.role === 'COMPANY') {
        router.push('/company/profile')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect based on role
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Frame className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            学生企業マッチングシステム
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            学生の得意分野と企業の募集条件を自動でマッチング。
            最適な就職先を見つけるお手伝いをします。
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-3">
              ログインして始める
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>学生向け</CardTitle>
              <CardDescription>
                あなたの得意分野に基づいて最適な企業をマッチング
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• プロフィール管理</li>
                <li>• マッチング結果確認</li>
                <li>• 企業情報閲覧</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>企業向け</CardTitle>
              <CardDescription>
                募集条件に合った優秀な学生を効率的に発見
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• ポジション管理</li>
                <li>• 候補学生確認</li>
                <li>• マッチング承認</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>自動マッチング</CardTitle>
              <CardDescription>
                AIによる高精度なマッチングアルゴリズム
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• スキルベースマッチング</li>
                <li>• スコア算出</li>
                <li>• 最適化アルゴリズム</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            システムの特徴
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">高精度マッチング</h3>
              <p className="text-gray-600">
                学生の得意分野と企業の募集条件を詳細に分析し、
                最適なマッチングを提供します。
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">リアルタイム通知</h3>
              <p className="text-gray-600">
                マッチング結果や承認状況をリアルタイムで通知し、
                迅速な対応を可能にします。
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">詳細レポート</h3>
              <p className="text-gray-600">
                マッチング成功率や分野別統計など、
                詳細な分析レポートを提供します。
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">セキュアな環境</h3>
              <p className="text-gray-600">
                個人情報保護を徹底し、安全で信頼できる
                マッチング環境を提供します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
