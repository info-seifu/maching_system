"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Company, Position } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Eye, Building2, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') return

    const fetchCompanyDetails = async () => {
      try {
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single()

        if (companyError) throw companyError
        setCompany(companyData)

        // Fetch company positions
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })

        if (positionsError) throw positionsError
        setPositions(positionsData || [])
      } catch (error) {
        console.error('Error fetching company details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [user, companyId])

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

  if (!company) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">
            <div className="text-center py-8">企業が見つかりませんでした</div>
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
              <Link href="/companies">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">企業詳細</h1>
                <p className="text-muted-foreground">{company.name}の詳細情報</p>
              </div>
            </div>

            {/* Company Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  企業情報
                </CardTitle>
                <CardDescription>企業の基本プロフィール</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">企業名</label>
                      <p className="text-lg font-semibold">{company.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">業種</label>
                      <div className="mt-1">
                        {company.industry ? (
                          <Badge variant="outline">{company.industry}</Badge>
                        ) : (
                          <span className="text-muted-foreground">未設定</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">所在地</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{company.location}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">連絡先</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{company.contact_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>募集ポジション</CardTitle>
                  <CardDescription>この企業の募集中のポジション一覧</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  ポジション追加
                </Button>
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
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          募集ポジションがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {position.required_expertise.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
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
                            <Link href={`/positions/${position.id}`}>
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
