"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Student, Match } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function StudentDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<Student | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') return

    const fetchStudentDetails = async () => {
      try {
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single()

        if (studentError) throw studentError
        setStudent(studentData)

        // Fetch student matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            position:positions(
              *,
              company:companies(name)
            )
          `)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })

        if (matchesError) throw matchesError
        setMatches(matchesData || [])
      } catch (error) {
        console.error('Error fetching student details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentDetails()
  }, [user, studentId])

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

  if (!student) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">
            <div className="text-center py-8">学生が見つかりませんでした</div>
          </main>
        </div>
      </div>
    )
  }

  const calculateAge = (birthday: string) => {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/students">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">学生詳細</h1>
                <p className="text-muted-foreground">{student.name}さんの詳細情報</p>
              </div>
            </div>

            {/* Student Profile */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>学生の基本プロフィール</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">氏名</label>
                      <p className="text-lg font-semibold">{student.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">フリガナ</label>
                      <p>{student.furigana}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">生年月日</label>
                      <p>{new Date(student.birthday).toLocaleDateString('ja-JP')} ({calculateAge(student.birthday)}歳)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">性別</label>
                      <div className="mt-1">
                        <Badge variant={student.gender === '男' ? 'default' : 'secondary'}>
                          {student.gender}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">得意分野</label>
                      <div className="mt-1">
                        <Badge variant="outline">{student.expertise}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">登録日</label>
                      <p>{new Date(student.created_at).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matching History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>マッチング履歴</CardTitle>
                  <CardDescription>この学生のマッチング結果一覧</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    CSVエクスポート
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    マッチング再提案
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ポジション</TableHead>
                      <TableHead>企業名</TableHead>
                      <TableHead>スコア</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>日付</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          マッチング履歴がありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            {match.position?.title}
                          </TableCell>
                          <TableCell>
                            {match.position?.company?.name}
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
                            {new Date(match.created_at).toLocaleDateString('ja-JP')}
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
