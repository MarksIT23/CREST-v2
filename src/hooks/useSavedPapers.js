import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LEGACY_KEY = 'crest_saved';
const keyFor = (user) => (user?.id ? `crest_saved_${user.id}` : null);

function loadIds(key) {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeIds(key, ids) {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Quota or private mode — keep in-memory state only
  }
}

/**
 * Account-scoped bookmarks kept in localStorage (zero backend).
 * Guests cannot save — SaveButton redirects them to sign in.
 * Each account gets its own key, so libraries never leak across
 * accounts on a shared device. Pre-existing device-wide saves
 * under the legacy key are adopted once by the next signed-in
 * account, then the legacy key is removed.
 */
export default function useSavedPapers() {
  const { user } = useAuth();
  const key = keyFor(user);
  const [ids, setIds] = useState(() => loadIds(key));

  // Reload (or adopt legacy saves) whenever the account changes.
  useEffect(() => {
    if (!key) {
      setIds([]);
      return;
    }
    if (!localStorage.getItem(key) && localStorage.getItem(LEGACY_KEY)) {
      const adopted = loadIds(LEGACY_KEY);
      storeIds(key, adopted);
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        // ignore
      }
      setIds(adopted);
      return;
    }
    setIds(loadIds(key));
  }, [key]);

  // Cross-tab sync for the active account's key.
  useEffect(() => {
    const onStorage = (e) => {
      if (key && e.key === key) setIds(loadIds(key));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const has = useCallback((id) => ids.some((saved) => String(saved) === String(id)), [ids]);

  const toggle = useCallback((id) => {
    if (!key) return;
    setIds((prev) => {
      const exists = prev.some((saved) => String(saved) === String(id));
      const next = exists
        ? prev.filter((saved) => String(saved) !== String(id))
        : [...prev, id];
      storeIds(key, next);
      return next;
    });
  }, [key]);

  const remove = useCallback((id) => {
    if (!key) return;
    setIds((prev) => {
      const next = prev.filter((saved) => String(saved) !== String(id));
      storeIds(key, next);
      return next;
    });
  }, [key]);

  return { ids, has, toggle, remove, count: ids.length, canSave: !!key };
}
