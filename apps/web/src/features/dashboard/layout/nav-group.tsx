import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavLink, NavGroup } from "@/types/types";

export function NavGroup({ title, items }: NavGroup) {
  const href = useLocation({
    select: (location: { href: string }) => location.href,
  });
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="p-0 mb-3 text-[15px] font-medium">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;
          return (
            <React.Fragment key={key}>
              {item.separator && <SidebarSeparator className="my-1" />}
              <SidebarMenuLink item={item} href={href} />
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
        className="h-10 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon className="h-5 w-5" />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavLink) {
  return (
    href === item.url || // /endpint?search=param
    href.split("?")[0] === item.url // endpoint
  );
}
