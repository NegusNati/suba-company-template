import { useNavigate, useParams } from "@tanstack/react-router";
import { Edit, Trash2, UserCog, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteDialog } from "../../components/deletedialog";
import {
  useUserByIdQuery,
  useDeleteUserMutation,
  useAssignRoleMutation,
  useRolesQuery,
} from "../lib/users-query";
import type { AssignRole } from "../lib/users-schema";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api-base";

export default function UserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams({
    from: "/dashboard/user-management/$userId/",
  });
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "blogger" | "user" | undefined
  >(undefined);

  const { data, isPending, isError } = useUserByIdQuery(userId);
  const { data: rolesData } = useRolesQuery();

  const deleteMutation = useDeleteUserMutation({
    onSuccess: () => {
      toast.success("User deleted successfully!");
      navigate({ to: "/dashboard/user-management" });
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete user: ${mutationError.message}`);
    },
  });

  const assignRoleMutation = useAssignRoleMutation({
    onSuccess: () => {
      toast.success("Role assigned successfully!");
      setRoleDialogOpen(false);
    },
    onError: (mutationError) => {
      toast.error(`Failed to assign role: ${mutationError.message}`);
    },
  });

  const handleRoleAssignment = () => {
    if (!selectedRole) return;

    const roleData: AssignRole = { role: selectedRole };
    assignRoleMutation.mutate({
      id: userId,
      role: roleData,
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading user details...</div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Failed to load user details. Please try again.
        </div>
      </div>
    );
  }

  const user = data.data;
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  const resolveImageUrl = (imageUrl?: string | null) =>
    imageUrl
      ? imageUrl.startsWith("/")
        ? `${baseUrl}${imageUrl}`
        : imageUrl
      : "";

  const roleStyles = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    blogger: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };
  const roleLabels = {
    admin: "Admin",
    blogger: "Blogger",
    user: "User",
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Details</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/dashboard/user-management/$userId/edit",
                  params: { userId: user.id },
                })
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRole(user.role);
                setRoleDialogOpen(true);
              }}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* User information card */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-950 space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-start gap-6">
            {user.image ? (
              <AppImage
                src={resolveImageUrl(user.image)}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-medium text-primary border-2 border-gray-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${roleStyles[user.role]}`}
                >
                  {roleLabels[user.role]}
                </span>
                <div className="flex items-center gap-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        Email Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Email Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile information */}
          {(user.profile.firstName ||
            user.profile.lastName ||
            user.profile.phoneNumber ||
            user.profile.headshotUrl) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {user.profile.firstName && (
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{user.profile.firstName}</p>
                  </div>
                )}
                {user.profile.lastName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{user.profile.lastName}</p>
                  </div>
                )}
                {user.profile.phoneNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="font-medium">{user.profile.phoneNumber}</p>
                  </div>
                )}
                {user.profile.headshotUrl && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Profile Headshot
                    </p>
                    <AppImage
                      src={resolveImageUrl(user.profile.headshotUrl)}
                      alt="Profile headshot"
                      className="h-40 w-40 rounded object-cover border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {user.profile.socials && user.profile.socials.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.profile.socials.map((social) => (
                  <div
                    key={social.socialId}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    {social.socialIconUrl ? (
                      <AppImage
                        src={resolveImageUrl(social.socialIconUrl)}
                        alt={social.socialTitle}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-muted rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {social.socialTitle}
                      </p>
                      {social.handle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {social.handle}
                        </p>
                      )}
                    </div>
                    {(social.fullUrl ||
                      (social.socialBaseUrl && social.handle)) && (
                      <a
                        href={
                          social.fullUrl ||
                          `${social.socialBaseUrl}/${social.handle?.replace(/^@/, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="font-medium">{user.sessions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()} at{" "}
                  {new Date(user.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(user.updatedAt).toLocaleDateString()} at{" "}
                  {new Date(user.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={() => {
            deleteMutation.mutate(user.id);
            setDeleteDialogOpen(false);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Role Assignment Dialog */}
      {isRoleDialogOpen && (
        <Dialog open={isRoleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Change the role for {user.name}. Current role:{" "}
                <span className="font-semibold">{user.role}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="role-select">Select Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as "admin" | "blogger" | "user")
                }
              >
                <SelectTrigger id="role-select" className="mt-2">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesData?.data?.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setRoleDialogOpen(false)}
                disabled={assignRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleAssignment}
                disabled={
                  assignRoleMutation.isPending || selectedRole === user.role
                }
              >
                {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
