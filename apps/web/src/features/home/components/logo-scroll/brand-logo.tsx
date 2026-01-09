import StackIcon from "tech-stack-icons";

interface BrandLogoProps {
  icon?: string;
}

export function BrandLogo({ icon }: BrandLogoProps) {
  return (
    <div className="flex w-22 items-center gap-2 rounded-sm border   px-4 py-2 shadow-sm">
      {icon && <StackIcon variant="grayscale" name={icon} />}
    </div>
  );
}
