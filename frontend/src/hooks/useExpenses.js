import { useState, useEffect, useCallback, useMemo } from "react";
import { loadData, saveData, genId, entryTotal } from "../data/store";

export function useExpenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState(-1);
  const [search, setSearch] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [activePlaceFilter, setActivePlaceFilter] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [curPage, setCurPage] = useState(1);

  // Initial load from server
  useEffect(() => {
    loadData()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (newData) => {
    setData(newData);
    try {
      await saveData(newData);
    } catch (e) {
      setError(`Помилка збереження: ${e.message}`);
    }
  }, []);

  const allPlaces = useMemo(() => {
    const set = new Set();
    data.forEach((e) => e.places.forEach((p) => set.add(p.name)));
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data
      .filter((e) => {
        if (activePlaceFilter && !e.places.some((p) => p.name === activePlaceFilter)) return false;
        if (filterFrom && e.date < filterFrom) return false;
        if (filterTo && e.date > filterTo) return false;
        if (q) {
          const total = entryTotal(e);
          const txt = [
            e.date,
            String(total),
            ...e.places.map((p) => [p.name, p.details, p.notes].join(" ")),
          ]
            .join(" ")
            .toLowerCase();
          if (!txt.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let av = sortCol === "date" ? a.date : entryTotal(a);
        let bv = sortCol === "date" ? b.date : entryTotal(b);
        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      });
  }, [data, search, filterFrom, filterTo, activePlaceFilter, sortCol, sortDir]);

  function sort(col) {
    setSortDir((d) => (sortCol === col ? -d : 1));
    setSortCol(col);
    setCurPage(1);
  }

  function clearFilters() {
    setSearch("");
    setFilterFrom("");
    setFilterTo("");
    setActivePlaceFilter(null);
    setCurPage(1);
  }

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addEntry(entry) {
    const newData = [{ ...entry, id: genId() }, ...data];
    persist(newData);
  }

  function updateEntry(id, entry) {
    persist(data.map((e) => (e.id === id ? { ...entry, id } : e)));
  }

  function deleteEntry(id) {
    persist(data.filter((e) => e.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return {
    data, loading, error,
    filtered, allPlaces,
    sortCol, sortDir,
    search, setSearch,
    filterFrom, setFilterFrom,
    filterTo, setFilterTo,
    activePlaceFilter, setActivePlaceFilter,
    expandedIds,
    curPage, setCurPage,
    sort, clearFilters,
    toggleExpand, addEntry, updateEntry, deleteEntry,
  };
}
