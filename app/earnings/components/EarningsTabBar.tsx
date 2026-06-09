import Link from "next/link";
import { Calendar, BarChart3, Plus, Receipt, Calculator, User } from "lucide-react";

export function EarningsTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        <Link href="/earnings" className="flex flex-col items-center p-2">
          <Plus className="w-6 h-6 text-[#1D9E75]" />
          <span className="text-xs text-gray-900 font-medium">Today</span>
        </Link>
        <Link href="/earnings/history" className="flex flex-col items-center p-2">
          <Calendar className="w-6 h-6 text-gray-600" />
          <span className="text-xs text-gray-600">History</span>
        </Link>
        <Link href="/earnings/analytics" className="flex flex-col items-center p-2">
          <BarChart3 className="w-6 h-6 text-gray-600" />
          <span className="text-xs text-gray-600">Analytics</span>
        </Link>
        <Link href="/earnings/expenses" className="flex flex-col items-center p-2">
          <Receipt className="w-6 h-6 text-gray-600" />
          <span className="text-xs text-gray-600">Expenses</span>
        </Link>
        <Link href="/earnings/settings" className="flex flex-col items-center p-2">
          <User className="w-6 h-6 text-gray-600" />
          <span className="text-xs text-gray-600">Settings</span>
        </Link>
      </div>
    </nav>
  );
}