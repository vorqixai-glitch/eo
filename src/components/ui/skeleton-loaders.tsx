import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 px-2 py-4">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-1/3 mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function ChatViewSkeleton() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-start gap-3 w-3/4">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-20 w-full rounded-2xl rounded-tl-none" />
      </div>
      <div className="flex items-start gap-3 w-3/4 ml-auto justify-end">
        <Skeleton className="h-16 w-full rounded-2xl rounded-tr-none" />
      </div>
      <div className="flex items-start gap-3 w-5/6">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="w-full space-y-2">
          <Skeleton className="h-24 w-full rounded-2xl rounded-tl-none" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ArtifactSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-2/3 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl mt-6" />
    </div>
  );
}
