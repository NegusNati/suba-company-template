import {
  Network,
  Handshake,
  Briefcase,
  HelpCircle,
  Layers,
  Newspaper,
  MessageCircleMore,
  Images,
  Folders,
  MessageSquareText,
  CircleUserRound,
  UsersRound,
  Tags,
} from "lucide-react";

import { type SidebarData } from "@/types/types";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Content Management",
      items: [
        {
          title: "Blogs",
          url: "/dashboard/blogs",
          icon: Newspaper,
        },
        {
          title: "Vacancies",
          url: "/dashboard/vacancies",
          icon: Briefcase,
        },
        {
          title: "Organizational Structure",
          url: "/dashboard/organizational-structure",
          icon: Network,
        },
        {
          title: "Testimonials",
          url: "/dashboard/testimonials",
          icon: MessageCircleMore,
        },
        {
          title: "Partners",
          url: "/dashboard/partners",
          icon: Handshake,
        },
        {
          title: "Client Projects",
          url: "/dashboard/client-projects",
          icon: Briefcase,
        },
        {
          title: "FAQs",
          url: "/dashboard/faqs",
          icon: HelpCircle,
        },
        {
          title: "Gallery",
          url: "/dashboard/gallery",
          icon: Images,
        },
        {
          title: "Services",
          url: "/dashboard/services",
          icon: Layers,
        },
        {
          title: "Tags",
          url: "/dashboard/tags",
          icon: Tags,
        },
        {
          title: "Products",
          url: "/dashboard/products",
          icon: Folders,
        },
        {
          title: "Contact Us",
          url: "/dashboard/contact-us",
          icon: MessageSquareText,
          separator: true,
        },
        {
          title: "User Management",
          url: "/dashboard/user-management",
          icon: CircleUserRound,
          separator: true,
        },
        {
          title: "Socials",
          url: "/dashboard/socials",
          icon: UsersRound,
        },
      ],
    },
  ],
};
