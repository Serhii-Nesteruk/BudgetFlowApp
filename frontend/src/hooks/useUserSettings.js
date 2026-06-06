import { useCallback, useEffect, useState } from "react";
import { getUserSettings } from "../api/userSettingsApi";

const DEFAULT_SETTINGS = {
  baseCurrency: "PLN",
  language: "uk",
};

export function useUserSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserSettings();
      setSettings((current) => ({ ...current, ...data }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onUpdated = (event) => {
      if (event.detail) setSettings((current) => ({ ...current, ...event.detail }));
    };
    window.addEventListener("user-settings-updated", onUpdated);
    return () => window.removeEventListener("user-settings-updated", onUpdated);
  }, []);

  return { settings, loading, error, reload };
}
