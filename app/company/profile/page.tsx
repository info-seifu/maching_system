"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Company } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Mail, Calendar } from 'lucide-react'

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'COMPANY') return

    const fetchCompanyProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [user])

  if (user?.role !== 'COMPANY') {
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
            <div className="text-center py-8">企業プロフィールが見つかりませんでした</div>
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
              <h1 className="text-3xl font-bold">企業ページ</h1>
              <p className="text-muted-foreground">企業プロフィール情報</p>
            </div>

            {/* Company Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  企業情報
                </CardTitle>
                <CardDescription>基本情報</CardDescription>
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
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">登録日</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(company.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle>ようこそ、{company.name}様！</CardTitle>
                <CardDescription>学生企業マッチングシステムへ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  このシステムでは、貴社の募集ポジションに最適な学生をマッチングします。
                  「募集ポジション」ページで新しいポジションを作成し、候補学生を確認できます。
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
