"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Student, Company, Position } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Zap, Users, Building2, Target, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface MatchingCandidate {
  student: Student
  position: Position & { company: Company }
  score: number
}

export default function AdminMatchingPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [positions, setPositions] = useState<(Position & { company: Company })[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [matchingCandidates, setMatchingCandidates] = useState<MatchingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    if (user?.role !== 'ADMIN') return

    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .is('deleted_at', null)
          .order('name')

        if (studentsError) throw studentsError

        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .is('deleted_at', null)
          .order('name')

        if (companiesError) throw companiesError

        // Fetch positions with company info
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select(`
            *,
            company:companies(*)
          `)
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false })

        if (positionsError) throw positionsError

        setStudents(studentsData || [])
        setCompanies(companiesData || [])
        setPositions(positionsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "エラー",
          description: "データの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const calculateMatchingScore = (student: Student, position: Position): number => {
    let score = 0

    // 得意分野マッチング (70%)
    const expertiseMatch = position.required_expertise.includes(student.expertise)
    if (expertiseMatch) {
      score += 70
    } else {
      // 関連スキルのボーナス
      const relatedSkills = {
        'Webフロントエンド': ['UI/UXデザイン', 'モバイルアプリ開発'],
        'バックエンド開発': ['データベース設計', 'クラウドインフラ', 'セキュリティ'],
        'データサイエンス': ['機械学習', '人工知能'],
        'UI/UXデザイン': ['Webフロントエンド', 'ゲーム開発'],
        '機械学習': ['データサイエンス', '人工知能'],
        'モバイルアプリ開発': ['Webフロントエンド', 'UI/UXデザイン'],
        'クラウドインフラ': ['バックエンド開発', 'DevOps'],
        'ゲーム開発': ['UI/UXデザイン', 'モバイルアプリ開発'],
        'データベース設計': ['バックエンド開発', 'データサイエンス'],
        'セキュリティ': ['バックエンド開発', 'クラウドインフラ'],
        '人工知能': ['機械学習', 'データサイエンス'],
        'DevOps': ['クラウドインフラ', 'バックエンド開発']
      }

      const related = relatedSkills[student.expertise as keyof typeof relatedSkills] || []
      const hasRelatedSkill = position.required_expertise.some(skill => related.includes(skill))
      if (hasRelatedSkill) {
        score += 40
      }
    }

    // ランダム要素 (30%)
    score += Math.floor(Math.random() * 30)

    return Math.min(100, Math.max(0, score))
  }

  const runMatching = async () => {
    if (!selectedStudent && !selectedCompany) {
      toast({
        title: "選択エラー",
        description: "学生または企業を選択してください。",
        variant: "destructive",
      })
      return
    }

    setMatching(true)

    try {
      let candidates: MatchingCandidate[] = []

      if (selectedStudent && selectedCompany) {
        // 特定の学生と企業のマッチング
        const student = students.find(s => s.id === selectedStudent)
        const companyPositions = positions.filter(p => p.company_id === selectedCompany)
        
        if (student) {
          candidates = companyPositions.map(position => ({
            student,
            position,
            score: calculateMatchingScore(student, position)
          }))
        }
      } else if (selectedStudent) {
        // 特定の学生に対する全企業のマッチング
        const student = students.find(s => s.id === selectedStudent)
        
        if (student) {
          candidates = positions.map(position => ({
            student,
            position,
            score: calculateMatchingScore(student, position)
          }))
        }
      } else if (selectedCompany) {
        // 特定の企業に対する全学生のマッチング
        const companyPositions = positions.filter(p => p.company_id === selectedCompany)
        
        candidates = students.flatMap(student =>
          companyPositions.map(position => ({
            student,
            position,
            score: calculateMatchingScore(student, position)
          }))
        )
      }

      // スコア順にソート
      candidates.sort((a, b) => b.score - a.score)
      
      // 上位20件に制限
      setMatchingCandidates(candidates.slice(0, 20))

      toast({
        title: "マッチング完了",
        description: `${candidates.length}件のマッチング候補を生成しました。`,
      })
    } catch (error) {
      console.error('Error running matching:', error)
      toast({
        title: "エラー",
        description: "マッチング処理に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setMatching(false)
    }
  }

  const saveMatch = async (candidate: MatchingCandidate) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          student_id: candidate.student.id,
          position_id: candidate.position.id,
          match_score: candidate.score,
          status: 'PROPOSED'
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "既存のマッチング",
            description: "このマッチングは既に存在します。",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "マッチング保存完了",
          description: "マッチング結果を保存しました。",
        })
      }
    } catch (error) {
      console.error('Error saving match:', error)
      toast({
        title: "エラー",
        description: "マッチングの保存に失敗しました。",
        variant: "destructive",
      })
    }
  }

  if (user?.role !== 'ADMIN') {
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

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">マッチング実行</h1>
              <p className="text-muted-foreground">学生と企業の最適なマッチングを実行します</p>
            </div>

            {/* Matching Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  マッチング条件設定
                </CardTitle>
                <CardDescription>
                  学生または企業を選択してマッチングを実行してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">学生を選択</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="学生を選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">すべての学生</SelectItem>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.expertise})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">企業を選択</label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="企業を選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">すべての企業</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.industry})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={runMatching} 
                      disabled={matching}
                      className="w-full"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {matching ? 'マッチング中...' : 'マッチング実行'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>学生数: {students.length}名</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>企業数: {companies.length}社</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>募集ポジション: {positions.length}件</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matching Results */}
            {matchingCandidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>マッチング結果</CardTitle>
                  <CardDescription>
                    スコア順に表示されています。「保存」ボタンでマッチング結果を確定できます。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>学生名</TableHead>
                        <TableHead>得意分野</TableHead>
                        <TableHead>企業名</TableHead>
                        <TableHead>ポジション</TableHead>
                        <TableHead>必須スキル</TableHead>
                        <TableHead>スコア</TableHead>
                        <TableHead>アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchingCandidates.map((candidate, index) => (
                        <TableRow key={`${candidate.student.id}-${candidate.position.id}`}>
                          <TableCell className="font-medium">
                            {candidate.student.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{candidate.student.expertise}</Badge>
                          </TableCell>
                          <TableCell>
                            {candidate.position.company.name}
                          </TableCell>
                          <TableCell>
                            {candidate.position.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {candidate.position.required_expertise.slice(0, 2).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.position.required_expertise.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.position.required_expertise.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{candidate.score}</span>
                              <div className="w-16 h-2 bg-muted rounded-full">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${candidate.score}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => saveMatch(candidate)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              保存
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
