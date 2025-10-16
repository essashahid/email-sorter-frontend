import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import GoodEmailsPage from "./pages/GoodEmailsPage.jsx";
import BadEmailsPage from "./pages/BadEmailsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useEmailContext } from "./context/EmailContext.jsx";

const navLinkClass =
  "px-3 py-2 rounded-md text-sm font-medium transition-colors";

const activeClass = "bg-primary text-white";
const inactiveClass = "text-slate-600 hover:text-slate-900 hover:bg-slate-200";

function App() {
  const { goodEmails, badEmails } = useEmailContext();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Checking your session…
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Email Sorter
            </h1>
            <p className="text-sm text-slate-500">
              Quickly triage your Gmail inbox by swiping right to keep or left
              to dismiss.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <nav className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
                }
              >
                Inbox
              </NavLink>
              <NavLink
                to="/good"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
                }
              >
                Good ({goodEmails.length})
              </NavLink>
              <NavLink
                to="/bad"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
                }
              >
                Bad ({badEmails.length})
              </NavLink>
            </nav>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-500 sm:text-right">
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || user.email}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                    {(user.name || user.email || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left sm:text-right">
                  <span className="font-semibold text-slate-800">
                    {user.name || user.email}
                  </span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/good" element={<GoodEmailsPage />} />
          <Route path="/bad" element={<BadEmailsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
