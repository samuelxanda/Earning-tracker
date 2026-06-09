"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BarChart3, Plus, Receipt, User } from "lucide-react";

const tabs = [
  { href: "/earnings", label: "Today", icon: Plus },
  { href: "/earnings/history", label: "History", icon: Calendar },
  { href: "/earnings/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/earnings/expenses", label: "Expenses", icon: Receipt },
  { href: "/earnings/settings", label: "Settings", icon: User },
];

export function EarningsTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/earnings") return pathname === "/earnings";
    if (href === "/earnings/settings") return pathname.startsWith("/earnings/settings");
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center p-2"
            >
              <Icon className={`w-6 h-6 ${active ? "text-[#1D9E75]" : "text-gray-600"}`} />
              <span className={`text-xs ${active ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
