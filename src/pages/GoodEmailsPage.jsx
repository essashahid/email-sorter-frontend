import { useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import EmailListItem from "../components/EmailListItem.jsx";
import { useEmailContext } from "../context/EmailContext.jsx";

function GoodEmailsPage() {
  const { goodEmails } = useEmailContext();
  const [expandedId, setExpandedId] = useState(null);

  const toggleEmail = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          Good emails ({goodEmails.length})
        </h2>
        <p className="text-sm text-slate-500">
          Messages you marked as valuable or worth keeping.
        </p>
      </header>

      {goodEmails.length === 0 ? (
        <EmptyState message="You haven’t marked any emails as good yet." />
      ) : (
        <ul className="space-y-3">
          {goodEmails.map((email) => (
            <EmailListItem
              key={email.id}
              body={email.body}
              email={email}
              accent="success"
              badgeIcon="👍"
              badgeLabel="Good email"
              isExpanded={expandedId === email.id}
              onToggle={() => toggleEmail(email.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default GoodEmailsPage;
