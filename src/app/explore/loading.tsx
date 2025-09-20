import { Skeleton } from "@/src/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
      {/* Hero section skeleton */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Skeleton className="h-8 w-32 rounded-full mb-4" />
        <Skeleton className="h-12 w-64 md:w-96 rounded-lg mb-3" />
        <Skeleton className="h-4 w-full max-w-md rounded mb-8" />

        {/* Featured tags skeleton */}
        <div className="flex flex-wrap gap-2 justify-center max-w-3xl mb-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
        </div>

        {/* Search form skeleton */}
        <div className="w-full max-w-3xl">
          <div className="flex flex-col md:flex-row gap-3">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-24 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content section skeleton */}
      <div className="max-w-7xl mx-auto mb-6">
        <Skeleton className="h-12 w-full rounded-xl mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="glass-effect rounded-xl overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 rounded mb-2" />
                  <Skeleton className="h-4 w-1/2 rounded mb-4" />
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
