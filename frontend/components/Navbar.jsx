"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";

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

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        setMounted(true);
    }, []);


    if (!mounted) return null;

  
    const hideNavbarRoutes = ["/signin", "/signup", "/forgetpassword"];
    if (hideNavbarRoutes.includes(pathname)) {
        return null;
    }

    const emailInitial = user?.email
        ? user.email.charAt(0).toUpperCase()
        : "?";

    const logout = () => {
        localStorage.removeItem("user");
        window.location.href = "/signin";
    };

    return (
        <nav className="fixed top-0 w-full border-b bg-background z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    MyApp
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/">Home</Link>
                    <Link href="/dashboard">Dashboard</Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 pl-2 pr-0"
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.image || ""} alt="User" />
                                    <AvatarFallback className="text-sm font-medium">
                                        {emailInitial}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full p-0"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.image || ""} alt="User" />
                                    <AvatarFallback className="text-sm font-medium">
                                        {emailInitial}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-64">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col gap-6 mt-6">
                                <Link href="/">Home</Link>
                                <Link href="/dashboard">Dashboard</Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}