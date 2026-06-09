import { Skeleton } from "@/components/ui/skeleton";

export default function EarningsLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}
