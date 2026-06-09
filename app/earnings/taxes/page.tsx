"use client";

import { Calculator, Download } from "lucide-react";
import { EarningsTabBar } from "../components/EarningsTabBar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";

export default function TaxesPage() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = createClient();
        const [earningsRes, expensesRes] = await Promise.all([
          client.database.from("earnings_entries").select("earnings"),
          client.database.from("expenses").select("amount"),
        ]);
        
        setTotalEarnings((earningsRes?.data || []).reduce((s: number, e: { earnings: number }) => s + e.earnings, 0));
        setTotalExpenses((expensesRes?.data || []).reduce((s: number, e: { amount: number }) => s + e.amount, 0));
      } catch (err: any) {
        console.error("Failed to fetch data:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const taxableIncome = totalEarnings - totalExpenses;

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Taxes</h1>
        <p className="text-gray-600">Loading...</p>
        <EarningsTabBar />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Taxes</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-gray-600 text-sm mb-1">Taxable Income (Est.)</p>
        <p className="text-2xl font-bold text-gray-900">${taxableIncome.toFixed(2)}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-lg font-semibold text-gray-900">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-lg font-semibold text-gray-900">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-900 font-medium mb-3">Tax Estimates (2026)</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Federal (10% est.)</span>
            <span className="text-gray-900">${(taxableIncome * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">State (5% est.)</span>
            <span className="text-gray-900">${(taxableIncome * 0.05).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Self-employment (15.3%)</span>
            <span className="text-gray-900">${(taxableIncome * 0.153).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg text-gray-900">
        <Download className="w-4 h-4" />
        Export for Tax Pro
      </button>

      <EarningsTabBar />
    </div>
  );
}