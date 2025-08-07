export default function ReportsLoading() {
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
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                <div className="h-10 w-28 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Report Cards */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-4">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
