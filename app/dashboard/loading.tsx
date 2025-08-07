export default function DashboardLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex flex-1">
        <div className="hidden border-r bg-muted/40 md:block w-64">
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <div className="h-8 w-40 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>

            {/* Recent Matches */}
            <div className="border rounded-lg">
              <div className="p-6 border-b">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="text-center">
                        <div className="h-4 w-28 bg-muted animate-pulse rounded mb-1" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="text-right">
                        <div className="h-6 w-8 bg-muted animate-pulse rounded mb-1" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
