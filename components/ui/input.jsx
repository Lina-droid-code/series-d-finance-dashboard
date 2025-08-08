export function Input({ className="", ...props }) {
  return <input className={`px-3 py-2 rounded-xl border bg-slate-800/70 border-slate-700 text-slate-100 ${className}`} {...props} />;
}
