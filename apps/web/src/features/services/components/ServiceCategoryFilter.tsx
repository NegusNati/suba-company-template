import React from "react";

interface Category {
  id: number | null;
  name: string;
  slug: string;
}

interface ServiceCategoryFilterProps {
  categories: Category[];
  activeCategory: Category;
  onCategorySelect: (category: Category) => void;
}

export const ServiceCategoryFilter: React.FC<ServiceCategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  return (
    <div className="flex overflow-x-auto gap-2 pb-8 -mx-6 px-6 scrollbar-hide items-center mb-4">
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategorySelect(category)}
          className={`
            whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all
            ${
              activeCategory.id === category.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
