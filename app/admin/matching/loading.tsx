export default function AdminMatchingLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex flex-1">
        <div className="hidden border-r bg-muted/40 md:block w-64">
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            {[...Array(6)].map((_, i) => (
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

            {/* Matching Controls */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex items-end">
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
