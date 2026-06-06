import { useMemo, useState } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { useCurrencyRates } from "./hooks/useCurrencyRates";
import { useUserSettings } from "./hooks/useUserSettings";
import { buildExpenseSummaryPLN } from "./utils/expenseStats";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import StatCards from "./components/StatCards";
import ScanReceiptModal from "./components/ScanReceiptModal";
import Toolbar from "./components/Toolbar";
import ExpenseTable from "./components/ExpenseTable";
import StatsTab from "./components/StatsTab";
import EntryModal from "./components/EntryModal";
import BudgetPage from "./components/BudgetPage";
import DebtsPage from "./components/DebtsPage";
import SettingsPage from "./components/SettingsPage";
import SavingsPage from "./components/SavingsPage";
import styles from "./App.module.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [statsMounted, setStatsMounted] = useState(false);
  const { rates, error: ratesError } = useCurrencyRates();
  const { settings } = useUserSettings();
  const baseCurrency = settings.baseCurrency || "PLN";

  const {
    data,
    loading,
    error,
    filtered,
    allPlaces,
    sortCol,
    sortDir,
    search,
    setSearch,
    filterFrom,
    setFilterFrom,
    filterTo,
    setFilterTo,
    activePlaceFilter,
    setActivePlaceFilter,
    expandedIds,
    curPage,
    setCurPage,
    sort,
    clearFilters,
    toggleExpand,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useExpenses();

  const tableSummary = useMemo(() => buildExpenseSummaryPLN(data, rates), [data, rates]);

  function handleTabChange(tab) {
    if (tab === "stats") setStatsMounted(true);
    setActiveTab(tab);
  }

  function openAdd() {
    setEditEntry(null);
    setModalOpen(true);
  }
  function openEdit(id) {
    setEditEntry(data.find((e) => e.id === id));
    setModalOpen(true);
  }

  function handleSave(formData) {
    if (editEntry) updateEntry(editEntry.id, formData);
    else addEntry(formData);
    setModalOpen(false);
  }

  function handleDelete(id) {
    if (window.confirm("Видалити цей запис?")) deleteEntry(id);
  }

  function handlePlaceFilter(place) {
    setActivePlaceFilter((prev) => (prev === place ? null : place));
    setCurPage(1);
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onScanReceipt={() => setScanOpen(true)}
      />

      <div className={styles.main}>
        <Topbar
          activeTab={activeTab}
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setCurPage(1);
          }}
          onAdd={openAdd}
          onScanReceipt={() => setScanOpen(true)}
        />

        <div className={styles.content}>
          {error && <div className={styles.error}>⚠ {error}</div>}

          {loading ? (
            <div className={styles.loading}>Завантаження…</div>
          ) : (
            <>
              {activeTab === "table" && (
                <>
                  <StatCards data={data} summary={tableSummary} />
                  <Toolbar
                    search={search}
                    onSearch={(v) => {
                      setSearch(v);
                      setCurPage(1);
                    }}
                    filterFrom={filterFrom}
                    onFilterFrom={(v) => {
                      setFilterFrom(v);
                      setCurPage(1);
                    }}
                    filterTo={filterTo}
                    onFilterTo={(v) => {
                      setFilterTo(v);
                      setCurPage(1);
                    }}
                    onClear={clearFilters}
                    allPlaces={allPlaces}
                    activePlaceFilter={activePlaceFilter}
                    onPlaceFilter={handlePlaceFilter}
                  />
                  <ExpenseTable
                    filtered={filtered}
                    expandedIds={expandedIds}
                    curPage={curPage}
                    setCurPage={setCurPage}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={sort}
                    onToggleExpand={toggleExpand}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </>
              )}
              {statsMounted && (
                <div style={{ display: activeTab === "stats" ? "block" : "none" }}>
                  <StatsTab data={data} rates={rates} ratesError={ratesError} />
                </div>
              )}
              {activeTab === "budget" && (
                <BudgetPage expenses={data} rates={rates} baseCurrency={baseCurrency} />
              )}
              {activeTab === "debts" && <DebtsPage rates={rates} baseCurrency={baseCurrency} />}
              {activeTab === "settings" && <SettingsPage />}
              {activeTab === "savings" && (
                <SavingsPage expenses={data} rates={rates} baseCurrency={baseCurrency} />
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onScanReceipt={() => setScanOpen(true)}
        onAdd={openAdd}
      />

      <EntryModal
        open={modalOpen}
        entry={editEntry}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        allPlaces={allPlaces}
      />

      {scanOpen && (
        <ScanReceiptModal
          onClose={() => setScanOpen(false)}
          onSuccess={(data) => console.log("Розпізнано:", data)}
        />
      )}
    </div>
  );
}
