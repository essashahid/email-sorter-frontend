import EmailContent from "./EmailContent.jsx";

const accentStyles = {
  success:
    "border-success/30 bg-success/10 text-success dark:border-success/40",
  danger: "border-danger/30 bg-danger/10 text-danger dark:border-danger/40",
  default: "border-slate-200 bg-slate-100 text-slate-600",
};

function getPreview(email) {
  if (!email.body) {
    return email.snippet || "";
  }

  const withoutTags = email.body
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");

  return withoutTags.replace(/\s+/g, " ").trim();
}

function EmailListItem({
  email,
  badgeLabel,
  badgeIcon,
  accent = "default",
  body,
  isExpanded = false,
  onToggle,
}) {
  const preview = getPreview(email);

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div
          className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold ${accentStyles[accent]}`}
        >
          <span>{badgeIcon}</span>
          {badgeLabel}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {email.subject}
          </p>
          <p className="mt-1 text-sm text-slate-500">{email.from}</p>
        </div>
        {preview && (
          <p className="max-h-24 overflow-hidden text-sm leading-relaxed text-slate-600">
            {preview}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary/10"
          >
            {isExpanded ? "Hide full email" : "View full email"}
          </button>
        </div>
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <EmailContent body={body || email.body || email.snippet} />
          </div>
        )}
      </div>
    </li>
  );
}

export default EmailListItem;
