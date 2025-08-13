import { Home, Search, Bell, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();

  const navigationItems = [
    { icon: Home, href: "/" },
    { icon: Search, href: "/explore" },
    { icon: Bell, href: "/notifications" },
    { icon: Mail, href: "/messages" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-twitter-border px-4 py-2 z-50">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <button className={`p-3 ${active ? "text-twitter-blue" : "text-gray-600"}`}>
                <Icon className={`text-xl ${active ? "fill-current" : ""}`} />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
