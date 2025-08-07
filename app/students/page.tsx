"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Student } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')

  const expertiseOptions = [
    'Webフロントエンド',
    'バックエンド開発',
    'データサイエンス',
    'UI/UXデザイン',
    '機械学習',
    'モバイルアプリ開発',
    'クラウドインフラ',
    'ゲーム開発',
    'データベース設計',
    'セキュリティ',
    '人工知能',
    'DevOps'
  ]

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') return

    const fetchStudents = async () => {
      try {
        let query = supabase
          .from('students')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,furigana.ilike.%${searchTerm}%`)
        }

        if (expertiseFilter) {
          query = query.eq('expertise', expertiseFilter)
        }

        if (genderFilter) {
          query = query.eq('gender', genderFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setStudents(data || [])
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [user, searchTerm, expertiseFilter, genderFilter])

  if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') {
    return <div>アクセス権限がありません</div>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">学生管理</h1>
                <p className="text-muted-foreground">登録されている学生の一覧と管理</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                学生を追加
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>フィルター</CardTitle>
                <CardDescription>学生を検索・絞り込みできます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="名前またはフリガナで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="得意分野" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {expertiseOptions.map((expertise) => (
                        <SelectItem key={expertise} value={expertise}>
                          {expertise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="性別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>学生一覧 ({students.length}名)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>氏名</TableHead>
                      <TableHead>フリガナ</TableHead>
                      <TableHead>年齢</TableHead>
                      <TableHead>性別</TableHead>
                      <TableHead>得意分野</TableHead>
                      <TableHead>登録日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          読み込み中...
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          学生が見つかりませんでした
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.furigana}</TableCell>
                          <TableCell>{calculateAge(student.birthday)}歳</TableCell>
                          <TableCell>
                            <Badge variant={student.gender === '男' ? 'default' : 'secondary'}>
                              {student.gender}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.expertise}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(student.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <Link href={`/students/${student.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
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
