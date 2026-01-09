import { cn } from "@/lib/utils";

function CursiveText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn("font-cursive text-2xl px-3 py-1 text-primary", className)}
    >
      {text}
    </span>
  );
}

export default CursiveText;
