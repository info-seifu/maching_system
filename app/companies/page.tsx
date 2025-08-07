"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Company } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Eye, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function CompaniesPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const industryOptions = [
    'IT',
    'テクノロジー',
    '金融',
    '製造業',
    'コンサルティング',
    'メディア',
    'ヘルスケア',
    '教育',
    '小売',
    'エンターテイメント'
  ]

  const locationOptions = [
    '東京都',
    '大阪府',
    '神奈川県',
    '愛知県',
    '福岡県',
    '北海道',
    '宮城県',
    '広島県',
    '京都府',
    '兵庫県'
  ]

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') return

    const fetchCompanies = async () => {
      try {
        let query = supabase
          .from('companies')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`)
        }

        if (industryFilter) {
          query = query.eq('industry', industryFilter)
        }

        if (locationFilter) {
          query = query.eq('location', locationFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setCompanies(data || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [user, searchTerm, industryFilter, locationFilter])

  if (user?.role !== 'ADMIN' && user?.role !== 'SCHOOL') {
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
                <h1 className="text-3xl font-bold">企業管理</h1>
                <p className="text-muted-foreground">提携企業の一覧と管理</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                企業を追加
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>フィルター</CardTitle>
                <CardDescription>企業を検索・絞り込みできます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="企業名で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="業種" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {industryOptions.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="所在地" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {locationOptions.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Companies Table */}
            <Card>
              <CardHeader>
                <CardTitle>企業一覧 ({companies.length}社)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>企業名</TableHead>
                      <TableHead>業種</TableHead>
                      <TableHead>所在地</TableHead>
                      <TableHead>連絡先</TableHead>
                      <TableHead>登録日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          読み込み中...
                        </TableCell>
                      </TableRow>
                    ) : companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          企業が見つかりませんでした
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {company.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {company.industry && (
                              <Badge variant="outline">{company.industry}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{company.location}</TableCell>
                          <TableCell>{company.contact_email}</TableCell>
                          <TableCell>
                            {new Date(company.created_at).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            <Link href={`/companies/${company.id}`}>
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
