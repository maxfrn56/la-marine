import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ReservationContext } from "./context";
import ReservationWidget from "./ReservationWidget";

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationWidget />
    </ReservationContext.Provider>
  );
}
