"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";

// Constants
const HIDE_NAVBAR_ROUTES = ["/signin", "/signup", "/forgot-password"];
const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
];

// Utility function to get user initial
const getUserInitial = (user) => {
    if (!user) return "?";
    const sources = [user.firstName, user.name, user.email];
    for (const source of sources) {
        if (source?.trim()) {
            return source.charAt(0).toUpperCase();
        }
    }
    return "?";
};

// Separate component for avatar to prevent re-renders
const UserAvatar = ({ user, size = "h-9 w-9" }) => {
    const initial = useMemo(() => getUserInitial(user), [user]);
    
    return (
        <Avatar className={size}>
            {user?.image?.trim() && (
                <AvatarImage src={user.image} alt={user?.email ?? "User"} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initial}
            </AvatarFallback>
        </Avatar>
    );
};

// Separate component for navigation links
const NavLinks = ({ links, className = "" }) => (
    <div className={className}>
        {links.map((link) => (
            <Link 
                key={link.href} 
                href={link.href}
                className="hover:text-primary transition-colors"
            >
                {link.label}
            </Link>
        ))}
    </div>
);

// Separate component for user menu
const UserMenu = ({ user, onLogout, align = "end" }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                className="flex items-center gap-2 pl-2 pr-0"
                aria-label="User menu"
            >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                <UserAvatar user={user} />
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-44">
            <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Memoized check for hiding navbar
    const shouldHideNavbar = useMemo(
        () => HIDE_NAVBAR_ROUTES.includes(pathname),
        [pathname]
    );

    // Load user from localStorage
    const loadUser = useCallback(() => {
        try {
            const storedUser = localStorage.getItem("user");
            
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to load user:", error);
            setUser(null);
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(() => {
        // Clear all auth data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        setUser(null);
        setIsSheetOpen(false); // Close mobile menu if open
        
        router.push("/signin");
    }, [router]);

    // Close sheet when navigating
    useEffect(() => {
        setIsSheetOpen(false);
    }, [pathname]);

    // Load user on mount and listen for changes
    useEffect(() => {
        setIsMounted(true);
        loadUser();

        // Listen for storage changes (cross-tab sync)
        const handleStorageChange = (e) => {
            if (e.key === "user" || e.key === "token") {
                loadUser();
            }
        };

        // Listen for custom user update events
        const handleUserUpdate = () => {
            loadUser();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userUpdated", handleUserUpdate);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userUpdated", handleUserUpdate);
        };
    }, [loadUser]);

    // Early return for hidden routes
    if (shouldHideNavbar) return null;

    // Loading state (prevents hydration mismatch)
    if (!isMounted) {
        return (
            <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link 
                        href="/" 
                        className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
                    >
                        MyApp
                    </Link>
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link 
                    href="/" 
                    className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
                >
                    MyApp
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <NavLinks links={NAV_LINKS} className="flex items-center gap-6" />
                    <UserMenu user={user} onLogout={handleLogout} />
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center gap-2">
                    {/* Mobile User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full p-0"
                                aria-label="User menu"
                            >
                                <UserAvatar user={user} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Menu Sheet */}
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-64">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>

                            <nav className="flex flex-col gap-4 mt-6">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-lg hover:text-primary transition-colors"
                                        onClick={() => setIsSheetOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}