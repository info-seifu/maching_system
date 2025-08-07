"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Match } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, Star } from 'lucide-react'

interface MatchWithDetails extends Match {
  position: {
    title: string
    description: string
    required_expertise: string[]
    company: {
      name: string
      industry: string
      location: string
    }
  }
}

export default function StudentMatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'STUDENT') return

    const fetchStudentMatches = async () => {
      try {
        // First get the student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (studentError) throw studentError

        // Then get matches for this student
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            position:positions(
              title,
              description,
              required_expertise,
              company:companies(name, industry, location)
            )
          `)
          .eq('student_id', studentData.id)
          .order('created_at', { ascending: false })

        if (matchesError) throw matchesError
        setMatches(matchesData || [])
      } catch (error) {
        console.error('Error fetching student matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentMatches()
  }, [user])

  if (user?.role !== 'STUDENT') {
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
              <h1 className="text-3xl font-bold">マッチング結果</h1>
              <p className="text-muted-foreground">あなたにマッチした企業のポジション一覧</p>
            </div>

            {loading ? (
              <Card>
                <CardContent className="text-center py-8">
                  読み込み中...
                </CardContent>
              </Card>
            ) : matches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">まだマッチング結果がありません。</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    管理者がマッチングを実行すると、ここに結果が表示されます。
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            {match.position.title}
                          </CardTitle>
                          <CardDescription>{match.position.company.name}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-lg">{match.match_score}</span>
                          </div>
                          <Badge
                            variant={
                              match.status === 'ACCEPTED' ? 'default' :
                              match.status === 'REJECTED' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {match.status === 'ACCEPTED' ? '承認済み' :
                             match.status === 'REJECTED' ? '見送り' : '検討中'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">企業情報</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">業種:</span>
                              <span className="ml-2">{match.position.company.industry}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">所在地:</span>
                              <span className="ml-2">{match.position.company.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">マッチング日:</span>
                              <span className="ml-1">{new Date(match.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">必須スキル</h4>
                          <div className="flex flex-wrap gap-2">
                            {match.position.required_expertise.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>

                        {match.position.description && (
                          <div>
                            <h4 className="font-medium mb-2">ポジション詳細</h4>
                            <p className="text-sm text-muted-foreground">{match.position.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
