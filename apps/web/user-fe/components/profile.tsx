"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleUserRound,
  LogOut,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL 

const options = [
  { label: "my profile", href: "/user" },
  { label: "community", href: "/community" },
]
function Profile() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/status`, { 
          credentials: "include",
        });
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user status", error);
      }
    };
    fetchStatus();
  }, []);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="p-3 bg-black/78 hover:bg-gray-100"
        >
          <CircleUserRound
            className="w-5.5 h-5.5 p-0 text-white hover:text-black"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-35">
        <DropdownMenuLabel className="flex flex-col">
          <span>Signed in as</span>
          <span className="text-xs font-normal text-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
           <DropdownMenuGroup>
          {options.map(({ label, href }) => (
            <DropdownMenuItem
              key={href}
              onClick={() => {
                window.location.href = href;
              }}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
          await fetch(`${API_URL}/api/auth/logout`, { 
            method: "POST",
            credentials: "include"
          });
          window.location.reload();
        }}>
          <LogOut size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { Profile };
