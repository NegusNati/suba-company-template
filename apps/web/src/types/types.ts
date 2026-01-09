import type { LinkProps } from "@tanstack/react-router";

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: LinkProps["to"];
  items?: never;
  separator?: boolean;
};

type NavItem = NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarData {
  navGroups: NavGroup[];
}

export type { SidebarData, NavGroup, NavItem, NavLink };
