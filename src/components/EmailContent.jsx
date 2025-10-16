const HTML_PATTERN = /<\/?[a-z][\s\S]*>/i;

function sanitizeHtml(html) {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

function EmailContent({ body = "" }) {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    return (
      <p className="text-sm text-slate-500">
        This email does not include a visible body.
      </p>
    );
  }

  const looksLikeHtml = HTML_PATTERN.test(trimmedBody);

  if (looksLikeHtml) {
    return (
      <div
        className="email-body-html text-sm leading-relaxed text-slate-700"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(trimmedBody) }}
      />
    );
  }

  return (
    <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
      {trimmedBody}
    </pre>
  );
}

export default EmailContent;
