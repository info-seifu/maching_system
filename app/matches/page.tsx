"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Match } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Download, Settings } from 'lucide-react'
import Link from 'next/link'

interface MatchWithDetails extends Match {
  student: {
    name: string
    expertise: string
  }
  position: {
    title: string
    company: {
      name: string
    }
  }
}

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return

    const fetchMatches = async () => {
      try {
        let query = supabase
          .from('matches')
          .select(`
            *,
            student:students(name, expertise),
            position:positions(
              title,
              company:companies(name)
            )
          `)
          .order('created_at', { ascending: false })

        if (statusFilter) {
          query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setMatches(data || [])
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user, statusFilter])

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
                <h1 className="text-3xl font-bold">マッチング管理</h1>
                <p className="text-muted-foreground">学生と企業のマッチング結果を管理</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  エクスポート
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  マッチング設定
                </Button>
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  自動マッチング実行
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>フィルター</CardTitle>
                <CardDescription>マッチング結果を絞り込みできます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      <SelectItem value="PROPOSED">提案中</SelectItem>
                      <SelectItem value="ACCEPTED">承認済み</SelectItem>
                      <SelectItem value="REJECTED">拒否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Matches Table */}
            <Card>
              <CardHeader>
                <CardTitle>マッチング一覧 ({matches.length}件)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生名</TableHead>
                      <TableHead>得意分野</TableHead>
                      <TableHead>ポジション</TableHead>
                      <TableHead>企業名</TableHead>
                      <TableHead>スコア</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>マッチング日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          読み込み中...
                        </TableCell>
                      </TableRow>
                    ) : matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          マッチング結果がありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            <Link href={`/students/${match.student_id}`} className="hover:underline">
                              {match.student.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{match.student.expertise}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/positions/${match.position_id}`} className="hover:underline">
                              {match.position.title}
                            </Link>
                          </TableCell>
                          <TableCell>{match.position.company.name}</TableCell>
                          <TableCell>
                            <span className="font-bold text-lg">{match.match_score}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                match.status === 'ACCEPTED' ? 'default' :
                                match.status === 'REJECTED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {match.status === 'ACCEPTED' ? '承認済み' :
                               match.status === 'REJECTED' ? '拒否' : '提案中'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(match.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <Link href={`/positions/${match.position_id}`}>
                              <Button variant="ghost" size="sm">
                                詳細
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
