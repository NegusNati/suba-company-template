import { useParams } from "@tanstack/react-router";

import { UserForm } from "./user-form";
import { useUserByIdQuery } from "../lib/users-query";

export default function EditUser() {
  const { userId } = useParams({
    from: "/dashboard/user-management/$userId/edit",
  });

  const { data, isPending, isError } = useUserByIdQuery(userId);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading user data...</div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Failed to load user data. Please try again.
        </div>
      </div>
    );
  }

  const user = data.data;

  return (
    <UserForm
      mode="edit"
      initialData={{
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        imageUrl: user.image ?? undefined,
        profile: {
          firstName: user.profile.firstName ?? undefined,
          lastName: user.profile.lastName ?? undefined,
          headshotUrl: user.profile.headshotUrl ?? undefined,
          phoneNumber: user.profile.phoneNumber ?? undefined,
        },
      }}
    />
  );
}
