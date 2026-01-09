import { Link } from "@tanstack/react-router";

import { NavGroup } from "./nav-group";

import company_logo_small from "@/assets/company-logo/logo-small.svg";
import company_logo from "@/assets/company-logo/logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/config/sidebar-data";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader
        className={cn(
          state === "expanded"
            ? "pr-7 pb-4 pt-3 pl-5"
            : "p-0 pt-3 flex items-center justify-center h-14",
        )}
      >
        <Link to="/" className="flex items-center justify-center">
          <div className="relative flex h-10 w-full items-center justify-center">
            <img
              src={company_logo}
              alt="Company Logo"
              className={cn(
                "absolute h-10 w-auto transition-all duration-300 ease-in-out will-change-transform opacity-0 scale-95",
                state === "expanded" && "opacity-100 scale-100",
              )}
              aria-hidden={state !== "expanded"}
            />
            <img
              src={company_logo_small}
              alt="Company Logo"
              className={cn(
                "absolute h-10 w-auto transition-all duration-300 ease-in-out will-change-transform opacity-0 scale-95",
                state === "collapsed" && "opacity-100 scale-100",
              )}
              aria-hidden={state !== "collapsed"}
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarTrigger
        className={cn(
          "absolute z-20 -translate-y-1/2 transition-all duration-300",
          state === "expanded" ? "left-64 top-4" : "left-12 top-4",
        )}
      />
      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
