"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Position } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Edit, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function CompanyPositionsPage() {
  const { user } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'COMPANY') return

    const fetchCompanyPositions = async () => {
      try {
        // First get the company record
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (companyError) throw companyError

        // Then get positions for this company
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false })

        if (positionsError) throw positionsError
        setPositions(positionsData || [])
      } catch (error) {
        console.error('Error fetching company positions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyPositions()
  }, [user])

  if (user?.role !== 'COMPANY') {
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
                <h1 className="text-3xl font-bold">募集ポジション</h1>
                <p className="text-muted-foreground">貴社の募集ポジション一覧</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新しいポジション
              </Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="text-center py-8">
                  読み込み中...
                </CardContent>
              </Card>
            ) : positions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">まだ募集ポジションがありません。</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    新しいポジションを作成して、優秀な学生とのマッチングを始めましょう。
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    最初のポジションを作成
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>ポジション一覧 ({positions.length}件)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ポジション名</TableHead>
                        <TableHead>必須スキル</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>開始日</TableHead>
                        <TableHead>終了日</TableHead>
                        <TableHead>作成日</TableHead>
                        <TableHead>アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {position.required_expertise.slice(0, 2).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {position.required_expertise.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{position.required_expertise.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={position.status === 'OPEN' ? 'default' : 'secondary'}
                            >
                              {position.status === 'OPEN' ? '募集中' : '終了'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {position.start_date ? 
                              new Date(position.start_date).toLocaleDateString('ja-JP') : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            {position.end_date ? 
                              new Date(position.end_date).toLocaleDateString('ja-JP') : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            {new Date(position.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/positions/${position.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  詳細
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                編集
                              </Button>
                            </div>
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
