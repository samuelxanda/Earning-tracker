"use client";

import Link from "next/link";
import { User, Wallet, Calculator, Download, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { href: "/earnings/settings/profile", label: "Profile", description: "Manage your personal information", icon: User },
  { href: "/earnings/settings/platforms", label: "Platforms", description: "Add or edit delivery platforms", icon: Layers },
  { href: "/earnings/settings/taxes", label: "Tax Settings", description: "Configure tax deduction rates", icon: Calculator },
  { href: "/earnings/settings/export", label: "Export Data", description: "Export earnings for tax purposes", icon: Download },
];

export default function SettingsHubPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-foreground mb-4">Settings</h1>
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
