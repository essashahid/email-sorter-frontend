import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const { signIn, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Email Sorter
          </h1>
          <p className="text-sm text-slate-500">
            Sign in with Google to triage your inbox with swipe gestures.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-5">
          <button
            type="button"
            onClick={signIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="text-lg">🔐</span>
            {loading ? "Connecting…" : "Continue with Google"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Google handles the sign-in flow and securely connects your Gmail
          account.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
