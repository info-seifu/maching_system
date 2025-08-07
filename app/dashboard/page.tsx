"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Building2, GraduationCap, Heart, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface DashboardStats {
  totalStudents: number
  totalCompanies: number
  totalMatches: number
  totalPositions: number
  recentMatches: any[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCompanies: 0,
    totalMatches: 0,
    totalPositions: 0,
    recentMatches: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') return

    const fetchStats = async () => {
      try {
        const [studentsRes, companiesRes, matchesRes, positionsRes, recentMatchesRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact' }).is('deleted_at', null),
          supabase.from('companies').select('id', { count: 'exact' }).is('deleted_at', null),
          supabase.from('matches').select('id', { count: 'exact' }),
          supabase.from('positions').select('id', { count: 'exact' }),
          supabase
            .from('matches')
            .select(`
              *,
              student:students(name, expertise),
              position:positions(title, company:companies(name))
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ])

        setStats({
          totalStudents: studentsRes.count || 0,
          totalCompanies: companiesRes.count || 0,
          totalMatches: matchesRes.count || 0,
          totalPositions: positionsRes.count || 0,
          recentMatches: recentMatchesRes.data || []
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (user?.role !== 'ADMIN') {
    return <div>アクセス権限がありません</div>
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">ダッシュボード</h1>
              <p className="text-muted-foreground">システム全体の概要を確認できます</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総学生数</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">登録済み学生</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総企業数</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">提携企業</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総マッチ数</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">成立したマッチング</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">募集ポジション</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPositions}</div>
                  <p className="text-xs text-muted-foreground">アクティブな募集</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>最近のマッチング</CardTitle>
                <CardDescription>直近のマッチング提案一覧</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{match.student?.name}</p>
                        <p className="text-sm text-muted-foreground">{match.student?.expertise}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{match.position?.title}</p>
                        <p className="text-sm text-muted-foreground">{match.position?.company?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{match.match_score}</p>
                        <p className="text-sm text-muted-foreground">スコア</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          match.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.status === 'ACCEPTED' ? '承認済み' :
                           match.status === 'REJECTED' ? '拒否' : '提案中'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
