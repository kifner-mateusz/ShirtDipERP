import Button, { buttonVariants } from "@/components/ui/Button";
import { useUserContext } from "@/context/userContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";
import { useElementSize } from "@mantine/hooks";
import { IconMenu2, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import Notifications from "./Notifications";
import Search from "./Search";

const Header = () => {
  const { ref, width: actionButtonsWidth } = useElementSize();
  const { setMobileOpen } = useUserContext();
  const isMobile = useIsMobile();

  return (
    <div className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b-[1px] border-stone-700 bg-stone-900 pr-4">
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
      <div
        id="HeaderTabs"
        className={`absolute left-0 top-0 h-14  transition-all ${"ml-20"}`}
        style={{
          width: `calc(100% - ${actionButtonsWidth}px - 1rem - ${"5.5rem"})`,
        }}
      ></div>
      <div className="flex justify-end gap-3" ref={ref}>
        <Search />
        {/* <Messages /> */}
        <Notifications />

        <Link
          href={"/erp/settings"}
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
            "rounded-full border-stone-600 bg-stone-800 hover:bg-stone-700 hover:text-stone-50",
          )}
        >
          <IconSettings className="stroke-gray-200" />
        </Link>
      </div>
    </div>
  );
};

export default Header;
