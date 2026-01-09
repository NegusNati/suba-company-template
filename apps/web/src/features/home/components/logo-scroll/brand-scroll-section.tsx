import { BrandLogo } from "./brand-logo";
import { BrandMarquee } from "./brand-marquee";

// Sample brand data - replace with your actual 50+ brands
const brandsRow1 = [
  "adobe",
  "ae",
  "ai",
  "amznwebserv",
  "analytics",
  "algolia",
  "android",
  "anthropic",
  "astro",
  "atom",
  "aws",
  "azure",
  "bedrock",
  "bunjs",
  "canva",
  "chakraui",
  "claude",
  "cloudflare",
  "css3",
  "dart",
  "digitalocean",
  "django",
  "docker",
];
const brandsRow2 = [
  "docker",
  "exa",
  "expressjs",
  "figma",
  "firebase",
  "flask",
  "flutter",
  "framer",
  "gcloud",
  "gemini",
  "git",
  "github",
  "gitlab",

  "grafana",
  "html5",
  "huggingface",
  "hunyuan",
  "id",
  "insomnia",
  "kotlin",
  "kubernetes",
  "langchain",
  "laravel",
  "lightroom",
];

const brandsRow3 = [
  "linux",
  "mariadb",
  "materialui",
  "meta",
  "mongodb",
  "mysql",
  "n8n",
  "nestjs",
  "nextjs2",
  "nitro",
  "nodejs",
  "npm2",
  "nvidia",
  "openai",
  "oracle",
  "php",
  "playwright",
  "postgresql",
  "postman",
  "prettier",
  "prisma",
  "ps",
  "pwa",
  "python",
  "pytorch",
  "qwen",
  "radixui",
  "react",
  "reactquery",
  "reactrouter",
  "redis",
  "redux",
  "shadcnui",
  "swagger",
  "tailwindcss",
  "tencent",
  "tRPC",
  "typescript",
  "ubuntu",
  "vercel",
  "vitejs",
  "vscode",
  "webpack",
  "xd",
  "zod",
];

export default function BrandScrollSection() {
  return (
    <div className="flex flex-col justify-center gap-4">
      {/* Row 1 - Medium speed, left to right */}
      <BrandMarquee duration={40} delay={0}>
        {brandsRow1.map((brand, i) => (
          <BrandLogo key={`row1-${i}`} icon={brand} />
        ))}
      </BrandMarquee>

      {/* Row 2 - Slower, right to left */}
      <BrandMarquee duration={48} reverse delay={0}>
        {brandsRow2.map((brand, i) => (
          <BrandLogo key={`row2-${i}`} icon={brand} />
        ))}
      </BrandMarquee>

      {/* Row 3 - Faster, left to right */}
      <BrandMarquee duration={32} delay={0}>
        {brandsRow3.map((brand, i) => (
          <BrandLogo key={`row3-${i}`} icon={brand} />
        ))}
      </BrandMarquee>
    </div>
  );
}
