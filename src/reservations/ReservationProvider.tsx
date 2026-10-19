import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { ReservationContext } from "./context";
import ReservationWidget from "./ReservationWidget";

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  useEffect(() => {
    if (!searchParams.has("reserver")) return;
    setOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("reserver");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationWidget />
    </ReservationContext.Provider>
  );
}
