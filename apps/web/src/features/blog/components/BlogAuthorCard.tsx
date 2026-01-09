import React from "react";

import type { BlogSocial } from "../lib/blog-schema";

import { API_BASE_URL } from "@/lib/api-base";

const SERVER_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

interface BlogAuthorCardProps {
  name: string;
  handle: string;
  avatarUrl: string;
  socials?: BlogSocial[];
}

/**
 * Get the full icon URL, prefixing with SERVER_URL for relative paths
 */
const getIconUrl = (iconUrl: string | null): string | null => {
  if (!iconUrl) return null;
  if (iconUrl.startsWith("http")) return iconUrl;
  return `${SERVER_URL}${iconUrl}`;
};

export const BlogAuthorCard: React.FC<BlogAuthorCardProps> = ({
  name,
  avatarUrl,
  socials = [],
}) => (
  <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm ring-1 ring-gray-100">
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    </div>
    <h3 className="font-serif font-bold text-foreground text-base mb-1">
      {name}
    </h3>

    {/* Always show the handle */}
    {socials.length > 0 && (
      <span className="flex items-center gap-1 text-sm font-medium text-gray-400">
        @{socials[0].handle}
      </span>
    )}

    {/* Show social icons if available */}
    {socials.length > 0 && (
      <div className="flex items-center gap-3 mt-3">
        {socials
          .filter((social) => social.iconUrl) // Only render socials with valid icons
          .map((social) => {
            const iconSrc = getIconUrl(social.iconUrl);
            return (
              <a
                key={social.id}
                href={social.fullUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all hover:scale-110 transform duration-200"
                title={`${social.title}${social.handle ? `: @${social.handle}` : ""}`}
              >
                <img
                  src={iconSrc!}
                  alt={social.title}
                  className="w-5 h-5 object-contain"
                />
              </a>
            );
          })}
      </div>
    )}
  </div>
);
