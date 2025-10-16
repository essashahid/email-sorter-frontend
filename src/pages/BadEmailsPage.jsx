import { useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import EmailListItem from "../components/EmailListItem.jsx";
import { useEmailContext } from "../context/EmailContext.jsx";

function BadEmailsPage() {
  const { badEmails } = useEmailContext();
  const [expandedId, setExpandedId] = useState(null);

  const toggleEmail = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          Bad emails ({badEmails.length})
        </h2>
        <p className="text-sm text-slate-500">
          Messages you marked as spam, irrelevant, or worth deleting.
        </p>
      </header>

      {badEmails.length === 0 ? (
        <EmptyState
          icon="🎯"
          message="No emails have been marked as bad. Keep triaging!"
        />
      ) : (
        <ul className="space-y-3">
          {badEmails.map((email) => (
            <EmailListItem
              key={email.id}
              body={email.body}
              email={email}
              accent="danger"
              badgeIcon="👎"
              badgeLabel="Bad email"
              isExpanded={expandedId === email.id}
              onToggle={() => toggleEmail(email.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default BadEmailsPage;
