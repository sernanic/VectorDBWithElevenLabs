import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const AuthButtons = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (user) {
    const initials = user.displayName
      ? user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : user.email?.[0].toUpperCase() || "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="font-medium">
            {user.email}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => navigate("/login")}
        className="text-sm font-medium"
      >
        Sign in
      </Button>
      <Button
        variant="default"
        onClick={() => navigate("/signup")}
        className="text-sm font-medium"
      >
        Create account
      </Button>
    </div>
  );
};
