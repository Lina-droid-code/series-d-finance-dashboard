import { useState, useRef, useEffect } from "react";

export function Select({ value, onValueChange, children }) {
  return <div className="relative">{children({ value, onValueChange })}</div>;
}

export function SelectTrigger({ className="", children, onClick }) {
  return (
    <button type="button" className={`px-3 py-2 rounded-xl border ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function SelectContent({ className="", open, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e){ if(ref.current && !ref.current.contains(e.target)) onClose?.(); }
    if(open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);
  if(!open) return null;
  return <div ref={ref} className={`absolute z-50 mt-2 rounded-xl border ${className}`}>{children}</div>;
}

export function SelectItem({ value, onSelect, children }) {
  return (
    <div
      className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, value }) {
  return <span>{value || placeholder}</span>;
}
