import {
  ChevronsUpDownIcon,
  CheckIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface AsyncSearchableSelectOption {
  label: string;
  value: string | number;
}

export interface AsyncSearchableSelectProps {
  id?: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  query: string;
  onQueryChange: (value: string) => void;
  options: AsyncSearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  isSearching?: boolean;
  error?: string | null;
}

export const AsyncSearchableSelect: React.FC<AsyncSearchableSelectProps> = ({
  id,
  value,
  onChange,
  query,
  onQueryChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
  isSearching = false,
  error = null,
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (inputRef.current) {
      setPopoverWidth(inputRef.current.offsetWidth);
    }
  }, [open]);

  const selectedLabel =
    options.find((opt) => String(opt.value) === String(value))?.label || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Input
            id={id}
            ref={inputRef}
            readOnly
            value={selectedLabel}
            placeholder={placeholder}
            onClick={() => setOpen(true)}
            className={cn(
              "cursor-pointer bg-white pr-10",
              error && "border-destructive",
            )}
            disabled={disabled}
          />
          <ChevronsUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={popoverWidth ? { width: popoverWidth } : {}}
        className="p-0"
      >
        <Command>
          <CommandInput
            value={query}
            onValueChange={onQueryChange}
            placeholder={isSearching ? "Searching…" : searchPlaceholder}
            disabled={isSearching}
          />
          <CommandList>
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={String(opt.label)}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        String(value) === String(opt.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AsyncSearchableSelect;
