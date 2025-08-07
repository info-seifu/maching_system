"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, BarChart3, TrendingUp, Users, Building2 } from 'lucide-react'

interface ReportData {
  expertiseStats: { expertise: string; count: number; matchRate: number }[]
  monthlyTrends: { month: string; matches: number; acceptanceRate: number }[]
  topCompanies: { name: string; positions: number; matches: number }[]
  recentActivity: any[]
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData>({
    expertiseStats: [],
    monthlyTrends: [],
    topCompanies: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') return

    const fetchReportData = async () => {
      try {
        // Fetch expertise statistics
        const { data: expertiseData } = await supabase
          .from('students')
          .select('expertise')
          .is('deleted_at', null)

        const expertiseCounts = expertiseData?.reduce((acc: any, student) => {
          acc[student.expertise] = (acc[student.expertise] || 0) + 1
          return acc
        }, {}) || {}

        // Fetch match data for expertise match rates
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            status,
            student:students(expertise)
          `)

        const expertiseMatchRates = Object.keys(expertiseCounts).map(expertise => {
          const totalMatches = matchData?.filter(m => m.student?.expertise === expertise).length || 0
          const acceptedMatches = matchData?.filter(m => m.student?.expertise === expertise && m.status === 'ACCEPTED').length || 0
          return {
            expertise,
            count: expertiseCounts[expertise],
            matchRate: totalMatches > 0 ? Math.round((acceptedMatches / totalMatches) * 100) : 0
          }
        })

        // Fetch company statistics
        const { data: companyData } = await supabase
          .from('companies')
          .select(`
            name,
            positions(id),
            positions!inner(matches(id))
          `)
          .is('deleted_at', null)

        const topCompanies = companyData?.map(company => ({
          name: company.name,
          positions: company.positions?.length || 0,
          matches: company.positions?.reduce((acc: number, pos: any) => acc + (pos.matches?.length || 0), 0) || 0
        })).sort((a, b) => b.matches - a.matches).slice(0, 5) || []

        // Generate mock monthly trends (in a real app, this would be calculated from actual data)
        const monthlyTrends = [
          { month: '2025-01', matches: 45, acceptanceRate: 78 },
          { month: '2025-02', matches: 52, acceptanceRate: 82 },
          { month: '2025-03', matches: 38, acceptanceRate: 75 },
          { month: '2025-04', matches: 61, acceptanceRate: 85 },
          { month: '2025-05', matches: 47, acceptanceRate: 79 },
          { month: '2025-06', matches: 55, acceptanceRate: 88 }
        ]

        // Fetch recent activity
        const { data: recentActivity } = await supabase
          .from('matches')
          .select(`
            *,
            student:students(name, expertise),
            position:positions(title, company:companies(name))
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        setReportData({
          expertiseStats: expertiseMatchRates,
          monthlyTrends,
          topCompanies,
          recentActivity: recentActivity || []
        })
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">レポート</h1>
                <p className="text-muted-foreground">マッチングシステムの分析レポート</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  CSVエクスポート
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  詳細レポート
                </Button>
              </div>
            </div>

            {loading ? (
              <Card>
                <CardContent className="text-center py-8">
                  読み込み中...
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Expertise Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      分野別統計
                    </CardTitle>
                    <CardDescription>得意分野別の学生数とマッチング成功率</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>得意分野</TableHead>
                          <TableHead>学生数</TableHead>
                          <TableHead>マッチング成功率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.expertiseStats.map((stat) => (
                          <TableRow key={stat.expertise}>
                            <TableCell className="font-medium">{stat.expertise}</TableCell>
                            <TableCell>{stat.count}名</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{stat.matchRate}%</span>
                                <div className="w-20 h-2 bg-muted rounded-full">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${stat.matchRate}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      月別トレンド
                    </CardTitle>
                    <CardDescription>マッチング数と承認率の推移</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>月</TableHead>
                          <TableHead>マッチング数</TableHead>
                          <TableHead>承認率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.monthlyTrends.map((trend) => (
                          <TableRow key={trend.month}>
                            <TableCell className="font-medium">
                              {new Date(trend.month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                            </TableCell>
                            <TableCell>{trend.matches}件</TableCell>
                            <TableCell>
                              <Badge variant={trend.acceptanceRate >= 80 ? 'default' : 'secondary'}>
                                {trend.acceptanceRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Top Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      企業別統計
                    </CardTitle>
                    <CardDescription>マッチング数上位企業</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>企業名</TableHead>
                          <TableHead>募集ポジション数</TableHead>
                          <TableHead>マッチング数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.topCompanies.map((company, index) => (
                          <TableRow key={company.name}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                {company.name}
                              </div>
                            </TableCell>
                            <TableCell>{company.positions}件</TableCell>
                            <TableCell>{company.matches}件</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近のアクティビティ</CardTitle>
                    <CardDescription>直近のマッチング活動</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{activity.student?.name}</p>
                            <p className="text-sm text-muted-foreground">{activity.student?.expertise}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{activity.position?.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.position?.company?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{activity.match_score}</p>
                            <Badge
                              variant={
                                activity.status === 'ACCEPTED' ? 'default' :
                                activity.status === 'REJECTED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {activity.status === 'ACCEPTED' ? '承認済み' :
                               activity.status === 'REJECTED' ? '拒否' : '提案中'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
