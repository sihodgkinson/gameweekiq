"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Bell,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
  UserCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SessionResponse {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

interface AccountMenuProps {
  className?: string;
  touchMode?: boolean;
}

const sessionFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as SessionResponse;
};

export function AccountMenu({ className, touchMode = false }: AccountMenuProps) {
  const router = useRouter();
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { data, mutate: mutateSession } = useSWR<SessionResponse>(
    "/api/auth/session",
    sessionFetcher,
    {
      revalidateOnFocus: true,
    }
  );

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [data?.user?.avatarUrl]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutateSession();
    router.push("/");
    router.refresh();
  }

  const user = data?.user;
  const name = user?.name || "Signed in user";
  const email = user?.email || "No email";
  const avatarUrl = !avatarFailed ? user?.avatarUrl : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex w-full items-center rounded-lg text-left transition-colors hover:bg-muted/70",
            touchMode ? "h-12 px-4" : "h-12 px-3",
            className
          )}
          aria-label="Open account menu"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center rounded-full border bg-background",
                touchMode ? "h-9 w-9" : "h-8 w-8"
              )}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <User className={cn(touchMode ? "h-5 w-5" : "h-4 w-4")} />
              )}
            </div>
            <div className="min-w-0">
              <p className={cn("truncate font-medium leading-none", touchMode ? "text-base" : "text-sm")}>
                {name}
              </p>
              <p className={cn("truncate pt-px text-muted-foreground", touchMode ? "text-sm" : "text-xs")}>
                {email}
              </p>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={touchMode ? "start" : "end"}
        side="top"
        sideOffset={8}
        className={cn(
          "p-0",
          touchMode
            ? "w-[var(--radix-dropdown-menu-trigger-width)] max-w-[calc(100vw-2rem)]"
            : "w-64"
        )}
      >
        <div className="p-1.5">
          <DropdownMenuItem disabled className={cn("rounded-md px-2.5", touchMode ? "h-10 text-base" : "h-8 text-sm")}>
            <UserCircle className={cn(touchMode ? "h-5 w-5" : "h-4 w-4")} />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={cn("rounded-md px-2.5", touchMode ? "h-10 text-base" : "h-8 text-sm")}>
            <CreditCard className={cn(touchMode ? "h-5 w-5" : "h-4 w-4")} />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem disabled className={cn("rounded-md px-2.5", touchMode ? "h-10 text-base" : "h-8 text-sm")}>
            <Bell className={cn(touchMode ? "h-5 w-5" : "h-4 w-4")} />
            Notifications
          </DropdownMenuItem>
          <div className={cn("flex items-center justify-between rounded-md px-2.5", touchMode ? "h-10 text-base" : "h-8 text-sm")}>
            <div className="inline-flex items-center gap-2 text-foreground">
              <Sun className={cn("text-muted-foreground", touchMode ? "h-5 w-5" : "h-4 w-4")} />
              <span>Theme</span>
            </div>
            <div className="inline-flex rounded-md border p-0.5">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm",
                  touchMode ? "h-7 w-7" : "h-6 w-6",
                  theme === "light"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTheme("light")}
                aria-label="Set light theme"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm",
                  touchMode ? "h-7 w-7" : "h-6 w-6",
                  theme === "dark"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTheme("dark")}
                aria-label="Set dark theme"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm",
                  touchMode ? "h-7 w-7" : "h-6 w-6",
                  theme === "system"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTheme("system")}
                aria-label="Use system theme"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <DropdownMenuItem
            className={cn("rounded-md px-2.5", touchMode ? "h-10 text-base" : "h-8 text-sm")}
            onSelect={() => void handleLogout()}
          >
            <LogOut className={cn(touchMode ? "h-5 w-5" : "h-4 w-4")} />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
