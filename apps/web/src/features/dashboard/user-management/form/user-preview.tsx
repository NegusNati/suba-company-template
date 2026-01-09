interface UserPreviewProps {
  name: string;
  email: string;
  role: "admin" | "blogger" | "user";
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarPreview?: string | null;
  headshotPreview?: string | null;
}

export function UserPreview({
  name,
  email,
  role,
  emailVerified,
  firstName,
  lastName,
  phoneNumber,
  avatarPreview,
  headshotPreview,
}: UserPreviewProps) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div className="border rounded-lg p-6 space-y-4 bg-white dark:bg-gray-950">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={name || "User avatar"}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-medium text-primary border-2 border-gray-200">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {name || "Unnamed User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {email || "No email"}
              </p>
            </div>
          </div>

          {/* Role */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Role
            </p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${roleStyles[role]}`}
            >
              {roleLabels[role]}
            </span>
          </div>

          {/* Email Verified */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Email Status
            </p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                emailVerified
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          {/* Profile Information */}
          {(firstName || lastName || phoneNumber || headshotPreview) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Profile Information</h4>
              <div className="space-y-2">
                {firstName && (
                  <div>
                    <p className="text-xs text-muted-foreground">First Name</p>
                    <p className="text-sm">{firstName}</p>
                  </div>
                )}
                {lastName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Last Name</p>
                    <p className="text-sm">{lastName}</p>
                  </div>
                )}
                {phoneNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="text-sm">{phoneNumber}</p>
                  </div>
                )}
                {headshotPreview && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Headshot
                    </p>
                    <img
                      src={headshotPreview}
                      alt="Profile headshot"
                      className="h-32 w-32 rounded object-cover border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
