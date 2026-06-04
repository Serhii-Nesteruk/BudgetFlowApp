import { useState } from "react";
import { useExpenses } from "./hooks/useExpenses";
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
import styles from "./App.module.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);

  const {
    data, loading, error, filtered, allPlaces,
    sortCol, sortDir,
    search, setSearch,
    filterFrom, setFilterFrom,
    filterTo, setFilterTo,
    activePlaceFilter, setActivePlaceFilter,
    expandedIds, curPage, setCurPage,
    sort, clearFilters,
    toggleExpand, addEntry, updateEntry, deleteEntry,
  } = useExpenses();

  function openAdd() { setEditEntry(null); setModalOpen(true); }
  function openEdit(id) { setEditEntry(data.find((e) => e.id === id)); setModalOpen(true); }

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
        onTabChange={setActiveTab}
        onScanReceipt={() => setScanOpen(true)}
      />

      <div className={styles.main}>
        <Topbar
          activeTab={activeTab}
          search={search}
          onSearch={(v) => { setSearch(v); setCurPage(1); }}
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
                  <StatCards data={data} />
                  <Toolbar
                    search={search} onSearch={(v) => { setSearch(v); setCurPage(1); }}
                    filterFrom={filterFrom} onFilterFrom={(v) => { setFilterFrom(v); setCurPage(1); }}
                    filterTo={filterTo} onFilterTo={(v) => { setFilterTo(v); setCurPage(1); }}
                    onClear={clearFilters}
                    allPlaces={allPlaces}
                    activePlaceFilter={activePlaceFilter}
                    onPlaceFilter={handlePlaceFilter}
                  />
                  <ExpenseTable
                    filtered={filtered}
                    expandedIds={expandedIds}
                    curPage={curPage} setCurPage={setCurPage}
                    sortCol={sortCol} sortDir={sortDir} onSort={sort}
                    onToggleExpand={toggleExpand}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </>
              )}
              {activeTab === "stats" && <StatsTab data={data} />}
              {activeTab === "budget" && <BudgetPage />}
            </>
          )}
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
