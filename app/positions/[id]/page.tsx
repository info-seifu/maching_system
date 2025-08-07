"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Position, Match, Student } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

interface MatchWithStudent extends Match {
  student: Student
}

export default function PositionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const positionId = params.id as string
  
  const [position, setPosition] = useState<Position | null>(null)
  const [matches, setMatches] = useState<MatchWithStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') return

    const fetchPositionDetails = async () => {
      try {
        // Fetch position details with company info
        const { data: positionData, error: positionError } = await supabase
          .from('positions')
          .select(`
            *,
            company:companies(*)
          `)
          .eq('id', positionId)
          .single()

        if (positionError) throw positionError
        setPosition(positionData)

        // Fetch matches for this position
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            student:students(*)
          `)
          .eq('position_id', positionId)
          .order('match_score', { ascending: false })

        if (matchesError) throw matchesError
        setMatches(matchesData || [])
      } catch (error) {
        console.error('Error fetching position details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPositionDetails()
  }, [user, positionId])

  const handleMatchAction = async (matchId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: action, updated_at: new Date().toISOString() })
        .eq('id', matchId)

      if (error) throw error

      // Update local state
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, status: action } : match
      ))

      toast({
        title: "更新完了",
        description: `マッチングを${action === 'ACCEPTED' ? '承認' : '拒否'}しました。`,
      })
    } catch (error) {
      console.error('Error updating match:', error)
      toast({
        title: "エラー",
        description: "マッチングの更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') {
    return <div>アクセス権限がありません</div>
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">
            <div className="text-center py-8">読み込み中...</div>
          </main>
        </div>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">
            <div className="text-center py-8">ポジションが見つかりませんでした</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link href={`/companies/${position.company_id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">ポジション詳細</h1>
                <p className="text-muted-foreground">{position.title}</p>
              </div>
            </div>

            {/* Position Details */}
            <Card>
              <CardHeader>
                <CardTitle>{position.title}</CardTitle>
                <CardDescription>{position.company?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">必須スキル</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {position.required_expertise.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ステータス</label>
                      <div className="mt-1">
                        <Badge variant={position.status === 'OPEN' ? 'default' : 'secondary'}>
                          {position.status === 'OPEN' ? '募集中' : '終了'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">開始日</label>
                      <p>{position.start_date ? new Date(position.start_date).toLocaleDateString('ja-JP') : '未設定'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">終了日</label>
                      <p>{position.end_date ? new Date(position.end_date).toLocaleDateString('ja-JP') : '未設定'}</p>
                    </div>
                  </div>
                </div>
                {position.description && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground">詳細説明</label>
                    <p className="mt-2 text-sm">{position.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Students */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>候補学生リスト</CardTitle>
                  <CardDescription>マッチングスコア順に表示</CardDescription>
                </div>
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再マッチング
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生名</TableHead>
                      <TableHead>得意分野</TableHead>
                      <TableHead>スコア</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          候補学生がいません
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            <Link href={`/students/${match.student.id}`} className="hover:underline">
                              {match.student.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{match.student.expertise}</Badge>
                          </TableCell>
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
                            {match.status === 'PROPOSED' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleMatchAction(match.id, 'ACCEPTED')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  承認
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMatchAction(match.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  拒否
                                </Button>
                              </div>
                            )}
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
