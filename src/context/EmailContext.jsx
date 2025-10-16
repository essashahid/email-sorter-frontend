import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext.jsx";

const EmailContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const DEFAULT_FILTERS = {
  maxResults: "",
  since: "",
  until: "",
  label: "",
  search: "",
};

function sanitizeFilters(raw = {}) {
  const sanitized = { ...DEFAULT_FILTERS };

  if (typeof raw.maxResults === "number" && Number.isFinite(raw.maxResults)) {
    sanitized.maxResults = clampMaxResults(raw.maxResults);
  } else if (typeof raw.maxResults === "string" && raw.maxResults.trim()) {
    const parsed = Number.parseInt(raw.maxResults, 10);
    if (Number.isFinite(parsed)) {
      sanitized.maxResults = clampMaxResults(parsed);
    }
  }

  sanitized.since =
    typeof raw.since === "string" ? raw.since.trim() : DEFAULT_FILTERS.since;
  sanitized.until =
    typeof raw.until === "string" ? raw.until.trim() : DEFAULT_FILTERS.until;
  sanitized.label =
    typeof raw.label === "string" ? raw.label.trim() : DEFAULT_FILTERS.label;
  sanitized.search =
    typeof raw.search === "string" ? raw.search.trim() : DEFAULT_FILTERS.search;

  if (sanitized.since && !isValidDateInput(sanitized.since)) {
    sanitized.since = DEFAULT_FILTERS.since;
  }

  if (sanitized.until && !isValidDateInput(sanitized.until)) {
    sanitized.until = DEFAULT_FILTERS.until;
  }

  if (sanitized.since && sanitized.until) {
    const sinceDate = new Date(sanitized.since);
    const untilDate = new Date(sanitized.until);
    if (sinceDate > untilDate) {
      sanitized.since = formatDateInput(untilDate);
      sanitized.until = formatDateInput(sinceDate);
    }
  }

  return sanitized;
}

function clampMaxResults(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_FILTERS.maxResults;
  }
  const result = Math.min(Math.max(Math.floor(value), 1), 500);
  return result;
}

function isValidDateInput(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function buildQueryParams(filters) {
  const params = {};

  if (Number.isFinite(filters.maxResults) && filters.maxResults > 0) {
    params.maxResults = filters.maxResults;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.label) {
    const labels = filters.label
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (labels.length > 0) {
      params.labelIds = labels.join(",");
    }
  }

  if (filters.since) {
    params.since = filters.since;
  }

  if (filters.until) {
    params.until = filters.until;
  }

  return params;
}

export function EmailProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [goodEmails, setGoodEmails] = useState([]);
  const [badEmails, setBadEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [fetchSummary, setFetchSummary] = useState(null);
  const filtersRef = useRef({ ...DEFAULT_FILTERS });
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const { user, refresh: refreshAuth } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchEmails = useCallback(
    async (overrides = {}) => {
      if (!user) {
        return;
      }

      const applied = sanitizeFilters({
        ...filtersRef.current,
        ...overrides,
      });

      filtersRef.current = applied;
      setFilters(applied);
      setLoading(true);
      setError(null);

      let cancelled = false;
      try {
        const params = buildQueryParams(applied);
        const [emailsResponse, classificationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/emails`, {
            params,
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/classifications`, {
            withCredentials: true,
          }),
        ]);

        const emails = emailsResponse.data?.emails ?? [];
        const classifications = classificationsResponse.data?.items ?? [];
        const requestedCount = emailsResponse.data?.requested;
        const deliveredCount = emailsResponse.data?.delivered ?? emails.length;

        if (userRef.current !== user) {
          cancelled = true;
          return;
        }

        const classificationLookup = new Map();
        const nextGood = [];
        const nextBad = [];

        classifications.forEach((item) => {
          if (!item || !item.id) {
            return;
          }

          const normalized = {
            id: item.id,
            label: item.label,
            subject: item.subject || "(no subject)",
            from: item.from || "Unknown sender",
            snippet: item.snippet || "",
            body: item.body || "",
            date: item.date || null,
            labelIds: item.labelIds || [],
          };

          classificationLookup.set(item.id, normalized);

          if (item.label === "good") {
            nextGood.push(normalized);
          } else if (item.label === "bad") {
            nextBad.push(normalized);
          }
        });

        const remainingQueue = [];

        emails.forEach((email) => {
          const normalizedEmail = {
            ...email,
            body: email.body || "",
            labelIds: email.labelIds || [],
          };

          const existing = classificationLookup.get(email.id);
          if (existing) {
            existing.subject = normalizedEmail.subject || existing.subject;
            existing.from = normalizedEmail.from || existing.from;
            existing.snippet = normalizedEmail.snippet || existing.snippet;
            existing.body = normalizedEmail.body || existing.body;
            existing.date = normalizedEmail.date || existing.date;
            existing.labelIds = normalizedEmail.labelIds || existing.labelIds;
          } else {
            remainingQueue.push(normalizedEmail);
          }
        });

        setQueue(remainingQueue);
        setGoodEmails(nextGood);
        setBadEmails(nextBad);
        setFetchSummary({
          requested: Number.isFinite(requestedCount)
            ? requestedCount
            : applied.maxResults || "",
          delivered: deliveredCount,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          refreshAuth?.();
        }

        const message =
          err.response?.status === 401
            ? "Your session expired. Please sign in again."
            : err.response?.data?.error || err.message;
        setError(message);
        setFetchSummary(null);
      } finally {
        setLoading(false);
        if (!cancelled) {
          setInitialized(true);
        }
      }
    },
    [user, refreshAuth]
  );

  useEffect(() => {
    if (!user) {
      filtersRef.current = { ...DEFAULT_FILTERS };
      setFilters({ ...DEFAULT_FILTERS });
      setQueue([]);
      setGoodEmails([]);
      setBadEmails([]);
      setFetchSummary(null);
      setError(null);
      setInitialized(false);
      setLoading(false);
      return;
    }

    fetchEmails({});
  }, [fetchEmails, user]);

  const currentEmail = queue.length > 0 ? queue[0] : null;

  const markEmail = useCallback(
    async (label) => {
      const email = queue[0];
      if (!email || !user) {
        return;
      }

      setQueue((prev) => prev.slice(1));
      if (label === "good") {
        setGoodEmails((prev) => [...prev, { ...email, label }]);
      } else {
        setBadEmails((prev) => [...prev, { ...email, label }]);
      }

      try {
        await axios.post(`${API_BASE_URL}/classifications`, {
          ...email,
          body: email.body || "",
          label,
        });
      } catch (classificationError) {
        const message =
          classificationError?.response?.data?.error ||
          classificationError?.message;
        console.warn("Failed to persist classification:", message);
      }
    },
    [queue, user]
  );

  const applyFilters = useCallback(
    (nextFilters) => {
      if (!user) {
        return;
      }
      fetchEmails(nextFilters);
    },
    [fetchEmails, user]
  );

  const resetFilters = useCallback(() => {
    if (!user) {
      return;
    }
    fetchEmails({ ...DEFAULT_FILTERS });
  }, [fetchEmails, user]);

  const refresh = useCallback(() => {
    if (!user) {
      return;
    }
    fetchEmails({});
  }, [fetchEmails, user]);

  const value = useMemo(
    () => ({
      queue,
      currentEmail,
      goodEmails,
      badEmails,
      loading,
      error,
      initialized,
      filters,
      fetchSummary,
      refresh,
      applyFilters,
      resetFilters,
      markGood: () => markEmail("good"),
      markBad: () => markEmail("bad"),
      remaining: queue.length,
    }),
    [
      queue,
      currentEmail,
      goodEmails,
      badEmails,
      loading,
      error,
      initialized,
      filters,
      fetchSummary,
      refresh,
      applyFilters,
      resetFilters,
      markEmail,
    ]
  );

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
}

export function useEmailContext() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmailContext must be used within an EmailProvider");
  }
  return context;
}
