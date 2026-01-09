export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag?: string;
  imageUrl?: string;
}
