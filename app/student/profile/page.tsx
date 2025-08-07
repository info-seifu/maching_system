"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Student } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Calendar, Award, Plus } from 'lucide-react'

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'STUDENT') return

    const fetchStudentProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching student profile:', error)
        } else {
          setStudent(data)
        }
      } catch (error) {
        console.error('Error fetching student profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentProfile()
  }, [user])

  const createStudentProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          name: 'サンプル 太郎',
          furigana: 'サンプル タロウ',
          birthday: '2005-04-15',
          gender: '男',
          expertise: 'Webフロントエンド'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating student profile:', error)
        return
      }

      setStudent(data)
    } catch (error) {
      console.error('Error creating student profile:', error)
    }
  }

  if (user?.role !== 'STUDENT') {
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
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">マイページ</h1>
                <p className="text-muted-foreground">学生プロフィール</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>プロフィールを作成</CardTitle>
                  <CardDescription>
                    学生プロフィールがまだ作成されていません。
                    プロフィールを作成してマッチングを開始しましょう。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={createStudentProfile}>
                    <Plus className="w-4 h-4 mr-2" />
                    プロフィールを作成
                  </Button>
                </CardContent>
              </Card>
            </div>
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
            <div>
              <h1 className="text-3xl font-bold">マイページ</h1>
              <p className="text-muted-foreground">あなたのプロフィール情報</p>
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  プロフィール
                </CardTitle>
                <CardDescription>基本情報</CardDescription>
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
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(student.birthday).toLocaleDateString('ja-JP')} ({calculateAge(student.birthday)}歳)</span>
                      </div>
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
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-4 h-4 text-muted-foreground" />
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

            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle>ようこそ、{student.name}さん！</CardTitle>
                <CardDescription>学生企業マッチングシステムへ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  このシステムでは、あなたの得意分野「{student.expertise}」に基づいて、
                  最適な企業のポジションをマッチングします。
                  マッチング結果は「マッチング結果」ページで確認できます。
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
