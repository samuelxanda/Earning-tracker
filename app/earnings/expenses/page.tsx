"use client";

import { Receipt, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { EarningsTabBar } from "../components/EarningsTabBar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const monthlyTotal = expenses.reduce((s, e) => s + e.amount, 0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const client = createClient();
        const response = await client.database.from("expenses").select("*").order("created_at", { ascending: false });
        setExpenses(response?.data || []);
      } catch (err: any) {
        console.error("Failed to fetch expenses:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <Link href="/earnings/expense/new" className="p-2 bg-[#1D9E75] rounded-lg">
          <Plus className="w-5 h-5 text-white" />
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-gray-600 text-sm mb-1">This Month</p>
        <p className="text-2xl font-bold text-gray-900">${monthlyTotal.toFixed(2)}</p>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/earnings/expense/${expense.id}` as any}
              className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{expense.category}</p>
                  <p className="text-gray-600 text-sm">{expense.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-[#1D9E75] font-semibold mt-2">${expense.amount.toFixed(2)}</p>
            </Link>
          ))}
          {expenses.length === 0 && (
            <p className="text-gray-600 text-center py-8">No expenses yet. Add your first expense!</p>
          )}
        </div>
      )}

      <EarningsTabBar />
    </div>
  );
}