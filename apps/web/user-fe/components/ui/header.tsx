"use client";

import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MoveRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

function Header1() {
    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        },
        {
            title: "Register",
            href: "/",
            description: "",
        },
        {
            title: "Company",
            description: "Efficiently handle citizen complaints and improve transparency in local governance.",
            items: [
                {
                    title: "About us",
                    href: "/about",
                },
                {
                    title: "Team",
                    href: "/team",
                },
                {
                    title: "Careers",
                    href: "/Careers",
                },
            ],
        }
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const viewportHeight = window.innerHeight;
            setIsScrolled(scrollPosition > viewportHeight * 0.8);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const MobileNavItem = ({ item }: { item: typeof navigationItems[0] }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        if (item.href) {
            return (
                <a
                    href={item.href}
                    className="block py-3 px-4 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                >
                    {item.title}
                </a>
            );
        }

        return (
            <div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {item.title}
                    <MoveRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                        {item.items?.map((subItem) => (
                            <a
                                key={subItem.title}
                                href={subItem.href}
                                className="block py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {subItem.title}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <header
            className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20'
                    : 'bg-transparent'
            }`}
        >
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <p className={`font-semibold text-lg transition-colors ${
                        isScrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                        SwarajDesk
                    </p>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-1">
                        <NavigationMenu>
                            <NavigationMenuList className="flex space-x-1">
                                {navigationItems.map((item) => (
                                    <NavigationMenuItem key={item.title}>
                                        {item.href ? (
                                            <NavigationMenuLink href={item.href}>
                                                <Button
                                                    variant="ghost"
                                                    className={`transition-colors ${
                                                        isScrolled
                                                            ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                                            : 'text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {item.title}
                                                </Button>
                                            </NavigationMenuLink>
                                        ) : (
                                            <>
                                                <NavigationMenuTrigger
                                                    className={`bg-transparent hover:bg-white/10 font-medium text-sm transition-colors ${
                                                        isScrolled
                                                            ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                                            : 'text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {item.title}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent className="!w-[450px] p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                    <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col h-full justify-between">
                                                            <p className="text-base font-medium text-gray-900 dark:text-white">{item.title}</p>
                                                            <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                                                        </div>
                                                        <div className="flex flex-col text-sm h-full justify-end space-y-1">
                                                            {item.items?.map((subItem) => (
                                                                <NavigationMenuLink
                                                                    href={subItem.href}
                                                                    key={subItem.title}
                                                                    className="flex flex-row justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 py-2 px-3 rounded-md transition-colors"
                                                                >
                                                                    <span className="text-gray-700 dark:text-gray-300">{subItem.title}</span>
                                                                    <MoveRight className="w-4 h-4 text-muted-foreground" />
                                                                </NavigationMenuLink>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </NavigationMenuContent>
                                            </>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Button className="p-4" onClick={() => window.location.href = '/auth/login'}>
                            Sign In
                        </Button>
                        <Button className="p-4" onClick={() => window.location.href = '/auth/signup'}>
                            Sign Up
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 z-50 transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Backdrop */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsMenuOpen(false)} />
                )}

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className={`lg:hidden absolute top-full left-0 right-0 z-50 mt-1 py-4 px-4 rounded-lg shadow-lg border transition-all ${
                        isScrolled
                            ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-white/20 dark:border-gray-700/20'
                    }`}>
                        <div className="space-y-2">
                            {navigationItems.map((item) => (
                                <MobileNavItem key={item.title} item={item} />
                            ))}
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="flex flex-col space-y-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/auth/login'}>
                                Sign In
                            </Button>
                            <Button className="w-full" onClick={() => window.location.href = '/auth/signup'}>
                                Sign Up
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export { Header1 };
