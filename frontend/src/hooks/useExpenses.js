import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getGroupedTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactionsApi";
import {
  entryTotal,
  entryToTransactionPayloads,
  placeToTransactionPayload,
} from "../mappers/transactionMapper";

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

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getGroupedTransactions();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const allPlaces = useMemo(() => {
    const set = new Set();

    data.forEach((entry) => {
      entry.places.forEach((place) => {
        if (place.name) set.add(place.name);
      });
    });

    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return data
      .filter((entry) => {
        if (
          activePlaceFilter &&
          !entry.places.some((place) => place.name === activePlaceFilter)
        ) {
          return false;
        }

        if (filterFrom && entry.date < filterFrom) return false;
        if (filterTo && entry.date > filterTo) return false;

        if (q) {
          const total = entryTotal(entry);

          const text = [
            entry.date,
            String(total),
            ...entry.places.map((place) =>
              [place.name, place.details, place.notes].join(" ")
            ),
          ]
            .join(" ")
            .toLowerCase();

          if (!text.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const av = sortCol === "date" ? a.date : entryTotal(a);
        const bv = sortCol === "date" ? b.date : entryTotal(b);

        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      });
  }, [
    data,
    search,
    filterFrom,
    filterTo,
    activePlaceFilter,
    sortCol,
    sortDir,
  ]);

  function sort(col) {
    setSortDir((dir) => (sortCol === col ? -dir : 1));
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

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  async function addEntry(entry) {
    try {
      setError(null);

      const payloads = entryToTransactionPayloads(entry);

      await Promise.all(payloads.map(createTransaction));

      await loadExpenses();
    } catch (e) {
      setError(`Помилка додавання: ${e.message}`);
    }
  }

  async function updateEntry(id, entry) {
    try {
      setError(null);

      const oldEntry = data.find((x) => x.id === id);

      if (!oldEntry) {
        throw new Error("Запис не знайдено");
      }

      const oldPlaceIds = oldEntry.places.map((p) => Number(p.id));
      const newPlaces = entry.places;

      const requests = newPlaces.map((place) => {
        const payload = placeToTransactionPayload(place, entry.date);

        if (oldPlaceIds.includes(Number(place.id))) {
          return updateTransaction(place.id, payload);
        }

        return createTransaction(payload);
      });

      const newPlaceIds = newPlaces
        .map((p) => Number(p.id))
        .filter(Boolean);

      const removedIds = oldPlaceIds.filter((oldId) => {
        return !newPlaceIds.includes(oldId);
      });

      requests.push(...removedIds.map(deleteTransaction));

      await Promise.all(requests);

      await loadExpenses();
    } catch (e) {
      setError(`Помилка оновлення: ${e.message}`);
    }
  }

  async function deleteEntry(id) {
    try {
      setError(null);

      const entry = data.find((x) => x.id === id);

      if (!entry) {
        throw new Error("Запис не знайдено");
      }

      await Promise.all(entry.places.map((place) => deleteTransaction(place.id)));

      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      await loadExpenses();
    } catch (e) {
      setError(`Помилка видалення: ${e.message}`);
    }
  }

  return {
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

    reload: loadExpenses,
  };
}