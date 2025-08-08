export function Button({ className="", children, onClick, variant }) {
  const base = "px-3 py-2 rounded-xl text-sm font-medium transition border";
  const variantClass = variant === "outline"
    ? "bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800/40"
    : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-transparent";
  return (
    <button className={`${base} ${variantClass} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
