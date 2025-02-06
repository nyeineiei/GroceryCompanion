import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingBag, LogOut, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-lg">GroceryGo</span>
          </a>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link href={user.role === "customer" ? "/orders" : "/dashboard"}>
                <a className={cn(
                  "text-sm font-medium px-3 py-2 rounded-md transition-colors",
                  (user.role === "customer" && location === "/orders") || 
                  (user.role === "shopper" && location === "/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}>
                  {user.role === "customer" ? "My Orders" : "Dashboard"}
                </a>
              </Link>
              <Link href={user.role === "customer" ? "/customer/history" : "/shopper/history"}>
                <a className={cn(
                  "text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
                  (user.role === "customer" && location === "/customer/history") ||
                  (user.role === "shopper" && location === "/shopper/history")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}>
                  <History className="h-4 w-4" />
                  History
                </a>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}