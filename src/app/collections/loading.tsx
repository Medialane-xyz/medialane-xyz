import { Skeleton } from "@/src/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-20 sm:pb-24 md:pb-32">
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Search & Filter Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Collections Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
