import { useEffect, useState } from "react";

function EmailFilters({ filters, onApply, onReset, disabled }) {
  const [formState, setFormState] = useState(() => mapFiltersToForm(filters));

  useEffect(() => {
    setFormState(mapFiltersToForm(filters));
  }, [filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply({
      maxResults: parseIntOrEmpty(formState.maxResults),
      since: formState.since,
      until: formState.until,
      label: formState.label,
      search: formState.search,
    });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </h3>
        <button
          type="button"
          className="text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          onClick={handleReset}
          disabled={disabled}
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Max emails
          </span>
          <input
            type="number"
            name="maxResults"
            min="1"
            max="500"
            placeholder="e.g. 25"
            value={formState.maxResults}
            onChange={handleChange}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-slate-400">
            Leave blank to use the backend default.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            From date
          </span>
          <input
            type="date"
            name="since"
            value={formState.since}
            onChange={handleChange}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            To date
          </span>
          <input
            type="date"
            name="until"
            value={formState.until}
            onChange={handleChange}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Gmail labels
          </span>
          <input
            type="text"
            name="label"
            value={formState.label}
            onChange={handleChange}
            placeholder="e.g. INBOX,IMPORTANT"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-slate-400">
            Comma-separated label IDs (e.g. INBOX, UNREAD, IMPORTANT).
          </span>
        </label>

        <label className="flex flex-col gap-2 md:col-span-2 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search term
          </span>
          <input
            type="text"
            name="search"
            value={formState.search}
            onChange={handleChange}
            placeholder="subject:report has:attachment"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-slate-400">
            Uses Gmail search syntax, combine with label/time filters for more
            precise triage.
          </span>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}

function mapFiltersToForm(filters) {
  return {
    maxResults:
      Number.isFinite(filters.maxResults) && filters.maxResults > 0
        ? String(filters.maxResults)
        : "",
    since: filters.since || "",
    until: filters.until || "",
    label: filters.label || "",
    search: filters.search || "",
  };
}

function parseIntOrEmpty(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return "";
  }
  return parsed;
}

export default EmailFilters;
