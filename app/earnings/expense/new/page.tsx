"use client";

import { ArrowLeft, DollarSign, Save, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/insforge";

const categories = ["Fuel", "Maintenance", "Insurance", "Phone", "Gear", "Other"];

export default function NewExpensePage() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const client = createClient();
      await client.database.from("expenses").insert([
        {
          category,
          amount: parseFloat(amount),
          date,
          description,
        },
      ]);
      window.location.href = "/earnings/expenses";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/earnings/expenses" className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description (optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <textarea
              placeholder="Add details..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1D9E75] text-[#1D9E75]-foreground rounded-md py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </div>
  );
}