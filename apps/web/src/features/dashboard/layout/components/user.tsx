import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ChevronDown, DotIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/api-base";
import { authClient } from "@/lib/auth-client";

export default function User() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");

  if (isPending) {
    return <Skeleton className="h-12 w-32" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link to="/login">Sign In</Link>
      </Button>
    );
  }

  const getInitials = (name: string) => {
    const [firstName = "", lastName = ""] = name.split(" ") ?? [];
    const firstInitial = firstName.charAt(0) || "";
    const lastInitial = lastName.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-0.5 py-2 md:px-2 md:py-2 h-auto"
        >
          {/* Profile Picture with online indicator */}
          <div className="relative">
            <Avatar className="w-11 h-11">
              <AvatarImage
                src={
                  session.user.image
                    ? `${baseUrl}${session.user.image}`
                    : undefined
                }
                alt={session.user.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            {/* Online Indicator */}
            <DotIcon className="absolute bottom-1 right-1 text-primary" />
          </div>

          {/* Name and Role */}
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{session.user.name}</span>
            <span className="text-primary text-xs">Admin</span>
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            Sign Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
