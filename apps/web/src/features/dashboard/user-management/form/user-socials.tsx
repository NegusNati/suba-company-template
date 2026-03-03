import { ExternalLink, Plus, Trash2 } from "lucide-react";

import type { SocialPlatform, useSocialsListQuery } from "../lib/users-query";
import type { UserSocial, UserSocialInput } from "../lib/users-schema";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api-base";

interface UserSocialsSectionProps {
  socials: UserSocialInput[];
  existingSocials: UserSocial[];
  availableSocials: ReturnType<typeof useSocialsListQuery>["data"];
  isLoading: boolean;
  isError?: boolean;
  disabled?: boolean;
  onAdd: (socialId: number) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "handle" | "fullUrl", value: string) => void;
}

export function UserSocialsSection({
  socials,
  existingSocials,
  availableSocials,
  isLoading,
  isError,
  disabled,
  onAdd,
  onRemove,
  onChange,
}: UserSocialsSectionProps) {
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  const resolveImageUrl = (imageUrl?: string | null) =>
    imageUrl
      ? imageUrl.startsWith("/")
        ? `${baseUrl}${imageUrl}`
        : imageUrl
      : "";

  // Get social platform details by ID
  const getSocialDetails = (socialId: number): SocialPlatform | undefined => {
    return availableSocials?.data?.find((s) => s.id === socialId);
  };

  // Get list of socials not yet added
  const getAvailableToAdd = () => {
    const addedIds = socials.map((s) => s.socialId);
    return (availableSocials?.data || []).filter(
      (s) => !addedIds.includes(s.id),
    );
  };

  const availableToAdd = getAvailableToAdd();

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Social Links</h3>

      {isLoading ? (
        <p className="text-muted-foreground">Loading available socials...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Failed to load available social platforms. Please refresh the page.
        </p>
      ) : (
        <div className="space-y-4">
          {socials.length === 0 && availableToAdd.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No social platforms available. Please add social platforms in the
              Socials management section first.
            </p>
          ) : socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No social links added yet.
            </p>
          ) : (
            socials.map((social, index) => {
              const details = getSocialDetails(social.socialId);
              const existing = existingSocials.find(
                (es) => es.socialId === social.socialId,
              );

              return (
                <div
                  key={social.socialId}
                  className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30"
                >
                  {/* Social Icon & Title */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    {details?.iconUrl ? (
                      <AppImage
                        src={resolveImageUrl(details.iconUrl)}
                        alt={details.title}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-muted rounded" />
                    )}
                    <span className="font-medium">
                      {details?.title || existing?.socialTitle || "Unknown"}
                    </span>
                  </div>

                  {/* Handle Input */}
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`handle-${social.socialId}`}>
                      Handle
                    </FieldLabel>
                    <Input
                      id={`handle-${social.socialId}`}
                      placeholder="@username"
                      value={social.handle || ""}
                      disabled={disabled}
                      onChange={(e) =>
                        onChange(index, "handle", e.target.value)
                      }
                    />
                  </Field>

                  {/* Full URL Input */}
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`url-${social.socialId}`}>
                      Full URL (optional)
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${social.socialId}`}
                        placeholder={`${details?.baseUrl || "https://"}/${social.handle || "username"}`}
                        value={social.fullUrl || ""}
                        disabled={disabled}
                        onChange={(e) =>
                          onChange(index, "fullUrl", e.target.value)
                        }
                      />
                      {social.fullUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(social.fullUrl!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Field>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6 text-destructive hover:text-destructive"
                    disabled={disabled}
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}

          {/* Add Social Dropdown */}
          {availableToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(value) => onAdd(parseInt(value, 10))}
                disabled={disabled}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add social..." />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((social) => (
                    <SelectItem key={social.id} value={String(social.id)}>
                      <div className="flex items-center gap-2">
                        {social.iconUrl ? (
                          <AppImage
                            src={resolveImageUrl(social.iconUrl)}
                            alt={social.title}
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-muted rounded" />
                        )}
                        {social.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || availableToAdd.length === 0}
                onClick={() => {
                  if (availableToAdd[0]) {
                    onAdd(availableToAdd[0].id);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          )}

          {availableToAdd.length === 0 && socials.length > 0 && (
            <p className="text-sm text-muted-foreground">
              All available social platforms have been added.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
