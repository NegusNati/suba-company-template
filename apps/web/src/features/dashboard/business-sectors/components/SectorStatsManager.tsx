import { GripVertical, Plus, Trash2 } from "lucide-react";

import type { BusinessSectorStatFormItem } from "../lib/business-sectors-schema";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SectorStatsManagerProps {
  stats: BusinessSectorStatFormItem[];
  onChange: (items: BusinessSectorStatFormItem[]) => void;
  isReadOnly?: boolean;
}

const normalizePositions = (items: BusinessSectorStatFormItem[]) =>
  items.map((item, index) => ({ ...item, position: index }));

export function SectorStatsManager({
  stats,
  onChange,
  isReadOnly = false,
}: SectorStatsManagerProps) {
  const addStat = () => {
    onChange(
      normalizePositions([
        ...stats,
        {
          statKey: "",
          statValue: "",
          position: stats.length,
        },
      ]),
    );
  };

  const updateStat = (
    index: number,
    patch: Partial<BusinessSectorStatFormItem>,
  ) => {
    const next = [...stats];
    const current = next[index];
    if (!current) return;

    next[index] = { ...current, ...patch };
    onChange(normalizePositions(next));
  };

  const removeStat = (index: number) => {
    onChange(normalizePositions(stats.filter((_, i) => i !== index)));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...stats];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(normalizePositions(next));
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Stats</FieldLabel>
        {!isReadOnly && (
          <Button type="button" variant="outline" size="sm" onClick={addStat}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stat
          </Button>
        )}
      </div>

      {stats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stats added.</p>
      ) : (
        <div className="space-y-3">
          {stats.map((item, index) => (
            <div
              key={`${item.statKey}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-3 md:grid-cols-[auto_1fr_1fr_auto]"
            >
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              )}

              <Input
                value={item.statKey}
                onChange={(event) =>
                  updateStat(index, { statKey: event.target.value })
                }
                placeholder="Stat key"
                disabled={isReadOnly}
              />

              <Input
                value={item.statValue}
                onChange={(event) =>
                  updateStat(index, { statValue: event.target.value })
                }
                placeholder="Stat value"
                disabled={isReadOnly}
              />

              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStat(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
