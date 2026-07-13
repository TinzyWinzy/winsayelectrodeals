import { Skeleton } from "@/components/ui/skeleton";

export default function SolarFinderLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}
