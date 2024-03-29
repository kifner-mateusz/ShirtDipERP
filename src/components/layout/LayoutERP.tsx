import type { PropsWithChildren } from "react";

import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/NavigationOld";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";

function LayoutERP({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();

  return (
    <div>
      <Header />

      <main
        className={cn(
          "min-h-screen pt-14 transition-all",
          !isMobile && "pl-[5.5rem]",
        )}
      >
        {children}
      </main>
      <Navigation />
    </div>
  );
}

export default LayoutERP;
