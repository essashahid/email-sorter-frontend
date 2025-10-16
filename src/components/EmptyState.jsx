function EmptyState({ icon = "📭", message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm sm:text-base">{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
