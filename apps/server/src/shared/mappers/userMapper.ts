import type { AuthorDto } from "../types/relations";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  socials?: Array<{
    id: number;
    handle: string | null;
    fullUrl: string | null;
    title: string;
    iconUrl: string | null;
    baseUrl: string;
  }>;
}

/**
 * Map a user to an author DTO
 * @param user - The user to map
 * @param includeEmail - Whether to include email (typically for admin contexts)
 */
export const mapUserToAuthor = (
  user: User,
  includeEmail: boolean = false,
): AuthorDto => {
  const createdAt =
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : user.createdAt;
  const updatedAt =
    user.updatedAt instanceof Date
      ? user.updatedAt.toISOString()
      : user.updatedAt;

  return {
    id: user.id,
    name: user.name,
    ...(includeEmail && { email: user.email }),
    image: user.image,
    socials: user.socials || [],
    createdAt,
    updatedAt,
  };
};
