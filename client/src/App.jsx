import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import useExpenses from './hooks/useExpenses'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import FilterBar from './components/FilterBar'
import Chart from './components/Chart'
import PieChart from './components/PieChart'
import Modal from './components/Modal'
import IncomeChart from './components/IncomeChart';
import ComparisonChart from './components/ComparisonChart';
import DailyComparisonChart from './components/DailyComparisonChart';
import CumulativeChart from './components/CumulativeChart';
import CategorySpendingChart from './components/CategorySpendingChart';
import IncomeForm from './components/IncomeForm'
import Login from './components/Login'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const {
    expenses,
    periodExpenses,
    filteredExpenses,
    loading,
    error,
    total,
    filteredTotal,
    filterCategory,
    setFilterCategory,
    timeRange,
    setTimeRange,
    addExpense,
    removeExpense,
    editExpense,
    incomes,
    periodIncomes,
    addIncome,
    removeIncome,
    totalIncome,
    remainingBalance
  } = useExpenses(user)

  const [activeTab, setActiveTab] = useState('dashboard');
  // Refresh trigger for incomes updates
  const [_refresh, setRefresh] = useState(0);
  useEffect(() => {
    setRefresh(r => r + 1);
  }, [incomes]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const topRef = useRef(null)


  const handleLoginSuccess = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setToastMessage(`Welcome back, ${userData.name}!`)
    setTimeout(() => setToastMessage(''), 3000)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // Helper to download CSV
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }
    const header = Object.keys(data[0])
    const rows = data.map(item =>
      header.map(field => `"${String(item[field] ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csvContent = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export current week's expenses
  const handleDownloadWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = (day + 6) % 7
    const monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(today.getDate() - diffToMonday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const weekExpenses = expenses.filter(exp => {
      if (!exp.date) return false
      const d = new Date(exp.date)
      return d >= monday && d <= sunday
    })
    const filename = `expenses_week_${monday.toISOString().slice(0, 10)}.csv`
    downloadCSV(weekExpenses, filename)
  }

  // Export today's expenses
  const handleDownloadDay = () => {
    const todayKey = new Date().toISOString().split('T')[0]
    const dayExpenses = expenses.filter(exp => {
      if (!exp.date) return false
      const dKey = new Date(exp.date).toISOString().split('T')[0]
      return dKey === todayKey
    })
    const filename = `expenses_today_${todayKey}.csv`
    downloadCSV(dayExpenses, filename)
  }

  // Export current week's incomes
  const handleDownloadIncomeWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = (day + 6) % 7
    const monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(today.getDate() - diffToMonday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    const weekIncomes = incomes.filter(inc => {
      if (!inc.date) return false
      const d = new Date(inc.date + 'T00:00:00')
      return d >= monday && d <= sunday
    })
    const filename = `income_week_${monday.toISOString().slice(0, 10)}.csv`
    downloadCSV(weekIncomes, filename)
  }

  // Export current month's incomes
  const handleDownloadIncomeMonth = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const monthIncomes = incomes.filter(inc => {
      if (!inc.date) return false
      const d = new Date(inc.date + 'T00:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    })
    const monthName = today.toLocaleString(undefined, { month: 'long' })
    const filename = `income_${monthName}_${year}.csv`
    downloadCSV(monthIncomes, filename)
  }

  const displayedExpenses = useMemo(() => {
    return filteredExpenses.filter(exp => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const titleMatch = exp.title?.toLowerCase().includes(query)
      const descMatch = exp.description?.toLowerCase().includes(query)
      return titleMatch || descMatch
    })
  }, [filteredExpenses, searchQuery])

  const displayedRecentExpenses = useMemo(() => {
    return periodExpenses.filter(exp => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const titleMatch = exp.title?.toLowerCase().includes(query)
      const descMatch = exp.description?.toLowerCase().includes(query)
      return titleMatch || descMatch
    }).slice(0, 5)
  }, [periodExpenses, searchQuery]);

  const displayedIncomes = useMemo(() => {
    return periodIncomes.filter(inc => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const sourceMatch = (inc.source || inc.title || '').toLowerCase().includes(query)
      return sourceMatch
    })
  }, [periodIncomes, searchQuery]);

  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B] border border-accent/25 text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <span className="text-accent">ℹ️</span> {toastMessage}
          </div>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row" ref={topRef}>
        {/* Sidebar placeholder during load */}
        <aside className="hidden lg:flex flex-col w-64 bg-navy-dark text-white border-r border-navy-border/50 shrink-0 h-screen sticky top-0">
          <div className="p-6 border-b border-navy-border/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-navy-dark text-lg font-bold shadow-md shadow-accent/25">
              Syn
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wider leading-none uppercase text-slate-100">Syntecxhub</h1>
              <span className="text-[10px] text-accent font-semibold tracking-widest uppercase">Expenses</span>
            </div>
          </div>
        </aside>

        {/* Spinner */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading expenses...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row" ref={topRef}>
      {/* Desktop Sidebar (30% Navy with dark blue color overlay and gradients) */}
      <aside className="relative hidden lg:flex flex-col w-64 bg-[#0A1128] text-white border-r border-[#1B2D54]/50 shrink-0 sticky top-0 h-screen overflow-hidden">
        {/* Dark Blue Color Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#101F42]/70 via-transparent to-[#0A1128]/95 pointer-events-none"></div>
        {/* Ambient Color Glow Overlays */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-[#00B4D8]/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-[#6366F1]/15 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo/Branding */}
          <div className="p-6 border-b border-navy-border/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-navy-dark text-lg font-bold shadow-md shadow-accent/25">
              Syn
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wider leading-none uppercase text-slate-100">Syntecxhub</h1>
              <span className="text-[10px] text-accent font-semibold tracking-widest uppercase">Expenses</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'dashboard'
                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                : 'text-slate-400 hover:bg-navy/60 hover:text-slate-100'
                }`}
            >
              <span>📊</span> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'expenses'
                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                : 'text-slate-400 hover:bg-navy/60 hover:text-slate-100'
                }`}
            >
              <span>💸</span> Expenses
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'incomes'
                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                : 'text-slate-400 hover:bg-navy/60 hover:text-slate-100'
                }`}
            >
              <span>💰</span> Incomes
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'analytics'
                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                : 'text-slate-400 hover:bg-navy/60 hover:text-slate-100'
                }`}
            >
              <span>📈</span> Analytics
            </button>
          </nav>

          {/* Quick Stats Box */}
          <div className="p-4 m-4 bg-navy/65 backdrop-blur-md border border-navy-border/80 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Total Spent</p>
            <p className="text-xl font-bold text-accent mt-0.5">Rs. {total.toLocaleString()}</p>
            <div className="w-full bg-navy-dark rounded-full h-1.5 mt-2 border border-navy-border/50">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((total / 100000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400">
              <span>Limit: Rs. 100,000</span>
              <span className={`font-semibold ${remainingBalance >= 0 ? 'text-accent' : 'text-rose-400'}`}>
                Bal: Rs. {remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* User Card */}
          <div className="p-4 border-t border-navy-border/30 flex items-center gap-3 bg-navy-dark/40">
            <div className="w-9 h-9 rounded-full bg-navy border border-navy-border flex items-center justify-center font-bold text-accent text-sm shrink-0">
              {user?.avatar || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate tracking-wide">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition duration-150 text-sm shrink-0"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <header className="lg:hidden bg-navy-dark text-white border-b border-navy-border/30 sticky top-0 z-40 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-navy-dark text-xs font-bold shadow-md shadow-accent/20 shrink-0">
            {user?.avatar || user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-100 truncate max-w-[80px]">{user?.name || 'User'}</span>
        </div>

        {/* Navigation Tabs on Mobile */}
        <div className="flex bg-navy border border-navy-border rounded-lg p-0.5 gap-0.5 items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${activeTab === 'dashboard' ? 'bg-accent text-navy-dark font-bold' : 'text-slate-400'
              }`}
          >
            Dash
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${activeTab === 'expenses' ? 'bg-accent text-navy-dark font-bold' : 'text-slate-400'
              }`}
          >
            List
          </button>
          <button
            onClick={() => setActiveTab('incomes')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${activeTab === 'incomes' ? 'bg-accent text-navy-dark font-bold' : 'text-slate-400'
              }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${activeTab === 'analytics' ? 'bg-accent text-navy-dark font-bold' : 'text-slate-400'
              }`}
          >
            Charts
          </button>
          <button
            onClick={handleLogout}
            className="px-2 py-1 rounded text-xs text-rose-400 hover:text-rose-600 transition duration-150"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Main Content Area (60% Light Gray Canvas) */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Top welcome banner */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-slate-200 pb-4 relative">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-dark tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'expenses' && 'Expense Records'}
              {activeTab === 'incomes' && 'Income Records'}
              {activeTab === 'analytics' && 'Expense Analytics'}
            </h2>
            {/* Global Time Range Selector */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 mt-3 w-fit">
              {['This Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'This Year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-white text-[#1b62cd] shadow-sm font-bold border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Sync text floated in top-right, Action Buttons & Search Bar directly below it */}
          <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">


            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Search Bar next to action buttons */}
              <div className="relative w-40 sm:w-48 md:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-8 pr-8 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {activeTab !== 'analytics' && (
                <>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="bg-accent hover:bg-accent-hover text-navy-dark font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-accent/15 whitespace-nowrap"
                  >
                    <span>💸</span> Add new expenses
                  </button>
                  <button
                    onClick={() => setShowIncomeModal(true)}
                    className="bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <span>💰</span> New Income
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Row */}
            <Summary
              total={total}
              filteredTotal={filteredTotal}
              filterCategory={filterCategory}
              expenses={periodExpenses}
              totalIncome={totalIncome}
              remainingBalance={remainingBalance}
              incomes={periodIncomes}
            />

            {/* Grid Layout: Chart and Recent Transactions side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <PieChart expenses={periodExpenses} />

              {/* Recent Transactions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="text-xs text-accent hover:text-accent-hover font-bold transition duration-150"
                  >
                    View All →
                  </button>
                </div>
                <ExpenseList
                  expenses={displayedRecentExpenses}
                  onDelete={removeExpense}
                  onEdit={editExpense}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Chart Section */}
            <Chart expenses={periodExpenses} timeRange={timeRange} />
            {/* Transactions Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider">All Transactions</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-navy text-slate-300 border border-navy-border px-2.5 py-0.5 rounded-full font-medium">
                  {displayedExpenses.length} matches
                </span>
                <button onClick={handleDownloadWeek} className="bg-white hover:bg-gray-100 text-navy-dark border border-gray-300 text-xs px-3 py-1 rounded">
                  Download Week
                </button>
                <button onClick={handleDownloadDay} className="bg-white hover:bg-gray-100 text-navy-dark border border-gray-300 text-xs px-3 py-1 rounded">
                  Download Today
                </button>
              </div>
            </div>
            {/* Filter Bar */}
            <FilterBar
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
            />
            {/* Expense List */}
            <ExpenseList
              expenses={displayedExpenses}
              onDelete={removeExpense}
              onEdit={editExpense}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">

            <Summary
              total={total}
              filteredTotal={filteredTotal}
              filterCategory={filterCategory}
              expenses={periodExpenses}
              totalIncome={totalIncome}
              remainingBalance={remainingBalance}
              incomes={periodIncomes}
            />
            <DailyComparisonChart expenses={periodExpenses} incomes={periodIncomes} timeRange={timeRange} />
            <div className="max-w-3xl mx-auto">
              <CumulativeChart expenses={periodExpenses} incomes={periodIncomes} timeRange={timeRange} />
            </div>
            <div className="w-full">
              <CategorySpendingChart expenses={periodExpenses} totalIncome={totalIncome} />
            </div>
          </div>
        )}

        {activeTab === 'incomes' && (
          <>
            {/* Income Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Income Over Time</h2>
              <IncomeChart incomes={periodIncomes} timeRange={timeRange} />
            </div>
            {/* Income List */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider">Income Records ({timeRange})</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-navy text-slate-300 border border-navy-border px-2.5 py-0.5 rounded-full font-medium">
                    {displayedIncomes.length} records
                  </span>
                  <button onClick={handleDownloadIncomeWeek} className="bg-white hover:bg-gray-100 text-navy-dark border border-gray-300 text-xs px-3 py-1 rounded">
                    Download Week
                  </button>
                  <button onClick={handleDownloadIncomeMonth} className="bg-white hover:bg-gray-100 text-navy-dark border border-gray-300 text-xs px-3 py-1 rounded">
                    Download Month
                  </button>
                </div>
              </div>
              {displayedIncomes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No income records for {timeRange}. Add your recent income!</p>
              ) : (
                <ul className="space-y-3">
                  {displayedIncomes.map((inc) => (
                    <li key={inc._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-navy-dark">{inc.source || inc.title || 'Income'}</p>
                        <p className="text-xs text-slate-400">{inc.date ? new Date(inc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-green-600">+ Rs. {inc.amount?.toLocaleString()}</span>
                        <button onClick={() => removeIncome(inc._id)} className="text-rose-400 hover:text-rose-600 text-xs transition" title="Delete">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add New Expense"
      >
        <ExpenseForm onAdd={addExpense} onClose={() => setShowExpenseModal(false)} />
      </Modal>

      {/* Add Income Modal */}
      <Modal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        title="Add New Income"
      >
        <IncomeForm onAdd={addIncome} onClose={() => setShowIncomeModal(false)} />
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B] border border-accent/25 text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="text-accent">ℹ️</span> {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App