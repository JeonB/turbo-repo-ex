import { Suspense } from "react";
import { Skeleton } from "@repo/ui/skeleton";
import { ConsoleApiBanner } from "../../components/console-api-banner";

function ConsoleApiBannerFallback() {
  return (
    <div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:pb-4 ui:pt-2 sm:ui:px-6 lg:ui:px-8">
      <Skeleton className="ui:h-14 ui:w-full" />
    </div>
  );
}

export default function ConsoleTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={<ConsoleApiBannerFallback />}>
        <ConsoleApiBanner />
      </Suspense>
    </>
  );
}
