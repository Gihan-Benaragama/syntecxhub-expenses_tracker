import React from 'react';

/**
 * AnalyticsStats displays Net Balance and Savings Rate.
 * Props:
 *   - totalIncome: number
 *   - totalExpenses: number (total)
 *   - remainingBalance: number
 */
const AnalyticsStats = ({ totalIncome = 0, totalExpenses = 0, remainingBalance = 0 }) => {
  const netBalance = remainingBalance;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const formattedRate = savingsRate.toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      {/* Net Balance Card */}
      <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Balance</p>
        <p className={`text-3xl font-extrabold mt-1.5 ${netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
          Rs. {netBalance.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${netBalance >= 0 ? 'bg-blue-500' : 'bg-rose-500'}`} />
          {netBalance >= 0 ? 'Positive' : 'Negative'}
        </p>
      </div>
      {/* Savings Rate Card */}
      <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Savings Rate</p>
        <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">
          {formattedRate}%
        </p>
        <p className="text-xs text-slate-400 mt-2">
          of total income saved
        </p>
      </div>
    </div>
  );
};

export default AnalyticsStats;
