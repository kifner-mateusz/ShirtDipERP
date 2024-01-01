import Button, { buttonVariants } from "@/components/ui/Button";
import { useUserContext } from "@/context/userContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";
import { useElementSize } from "@mantine/hooks";
import {
  IconChevronsDown,
  IconChevronsUp,
  IconMenu2,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import Notifications from "./Notifications";
import Search from "./Search";
import { useState } from "react";

const Header = () => {
  const { ref, width: actionButtonsWidth } = useElementSize();
  const { setMobileOpen } = useUserContext();
  const isMobile = useIsMobile();

  const [tabsOpen, setTabsOpen] = useState(false);

  return (
    <div className="fixed left-0 top-0 z-50 h-14 w-full">
      <div className="flex h-full  w-full items-center justify-between border-b bg-stone-900 pr-4">
        <div className="flex h-full flex-nowrap items-center justify-between gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="rounded-full"
            >
              <IconMenu2 />
            </Button>
          )}
          <div className="flex w-[5.5rem] items-center justify-center">
            <Link href="/erp/task" className="cursor-default">
              <img
                src="/assets/logo_micro.png"
                alt="Shirt Dip ERP"
                className="h-10"
              />
            </Link>
          </div>
        </div>
        {isMobile && (
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => setTabsOpen((v) => !v)}
          >
            {tabsOpen ? <IconChevronsDown /> : <IconChevronsUp />}
          </Button>
        )}
        <div className="flex justify-end gap-3" ref={ref}>
          <Search />
          {/* <Messages /> */}
          <Notifications />

          <Link
            href={"/erp/settings"}
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "rounded-full border-stone-800 bg-stone-800 hover:bg-stone-700 hover:text-stone-50",
            )}
          >
            <IconSettings className="stroke-gray-200" />
          </Link>
        </div>
        <div
          id="HeaderTabs"
          className={cn(
            `absolute left-0 top-0 transition-all`,
            isMobile
              ? "top-16 -z-10 h-fit w-full -translate-y-full rounded border-input bg-background p-2"
              : "ml-20 h-14",
            isMobile && tabsOpen ? "translate-y-0" : "",
          )}
          style={
            !isMobile
              ? {
                  width: `calc(100% - ${actionButtonsWidth}px - 1rem - 5.5rem)`,
                }
              : undefined
          }
        ></div>
      </div>
    </div>
  );
};

export default Header;
