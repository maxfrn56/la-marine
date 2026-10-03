import { createContext, useContext } from "react";

export type ReservationContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

export const ReservationContext = createContext<ReservationContextValue | null>(null);

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation doit être utilisé dans un ReservationProvider");
  }
  return context;
}
