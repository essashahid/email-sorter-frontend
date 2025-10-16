import EmailCard from "../components/EmailCard.jsx";
import EmailFilters from "../components/EmailFilters.jsx";
import { useEmailContext } from "../context/EmailContext.jsx";

function HomePage() {
  const {
    currentEmail,
    markGood,
    markBad,
    loading,
    error,
    initialized,
    refresh,
    remaining,
    filters,
    applyFilters,
    resetFilters,
    fetchSummary,
  } = useEmailContext();

  const normalizedError = error?.toLowerCase() ?? "";
  const showAuthHint =
    error &&
    (normalizedError.includes("token file not found") ||
      normalizedError.includes("oauth"));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Inbox triage
          </h2>
          <p className="text-sm text-slate-500">
            Swipe right to keep or swipe left to dismiss, Tinder-style.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"}/auth`}
            className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Connect Gmail
          </a>
          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh emails"}
          </button>
        </div>
      </div>

      <EmailFilters
        filters={filters}
        onApply={applyFilters}
        onReset={resetFilters}
        disabled={loading}
      />

      {Number.isFinite(fetchSummary?.requested) &&
        Number.isFinite(fetchSummary?.delivered) &&
        fetchSummary.delivered < fetchSummary.requested && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Loaded {fetchSummary.delivered} emails. Some of the {fetchSummary.requested} requested were already
            triaged or not available in Gmail, so they remain in your Good/Bad lists.
          </div>
        )}

      {loading && !initialized && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          Loading your inbox…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-danger">
          <p className="font-medium">Unable to load emails.</p>
          <p className="mt-1 text-sm">{error}</p>
          {showAuthHint && (
            <p className="mt-2 text-sm">
              Start the OAuth flow by visiting{" "}
              <a
                className="font-semibold underline"
                href={`${
                  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"
                }/auth`}
              >
                /auth
              </a>{" "}
              and completing the consent screen.
            </p>
          )}
        </div>
      )}

      {!loading && !error && initialized && (
        <EmailCard
          email={currentEmail}
          onGood={markGood}
          onBad={markBad}
          remaining={remaining}
        />
      )}
    </div>
  );
}

export default HomePage;
