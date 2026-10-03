import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as api from "../api/client";
import type { BookingConfig, BookingSlot, Reservation } from "../api/types";
import { useReservation } from "./context";
import { addDays, formatLongDate, formatTime, monthLabel, monthMatrix, weekdayOf } from "./dates";
import "./ReservationWidget.css";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type Draft = {
  party: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  website: string;
};

const emptyDraft = (party = 2): Draft => ({
  party,
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
  website: "",
});

export default function ReservationWidget() {
  const { isOpen, open, close } = useReservation();
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [cursor, setCursor] = useState("");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [closedDay, setClosedDay] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reservation: Reservation; emailSent: boolean } | null>(
    null
  );
  const [focus, setFocus] = useState<"party" | "date" | "time" | "contact">("party");
  const calRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void api
      .bookingConfig()
      .then((value) => {
        setConfig(value);
        setCursor(value.today.slice(0, 7));
      })
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("booking-open", isOpen);
    if (isOpen) setFocus("party");
    return () => document.documentElement.classList.remove("booking-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const target =
      focus === "date"
        ? calRef.current
        : focus === "time"
          ? slotsRef.current
          : focus === "contact"
            ? contactRef.current
            : null;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isOpen, focus, draft.date, draft.time, loadingSlots]);

  useEffect(() => {
    if (!isOpen || !draft.date || !config) return;
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    api
      .bookingAvailability(draft.date, draft.party)
      .then((result) => {
        if (cancelled) return;
        setSlots(result.slots);
        setClosedDay(result.closed);
        setDraft((prev) => {
          if (prev.time && !result.slots.some((s) => s.time === prev.time && s.state === "open")) {
            return { ...prev, time: "" };
          }
          return prev;
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Créneaux indisponibles.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, draft.date, draft.party, config]);

  const reset = () => {
    setDraft(emptyDraft(config?.minParty === 1 ? 2 : config?.minParty ?? 2));
    setSlots([]);
    setDone(null);
    setError(null);
    if (config) setCursor(config.today.slice(0, 7));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.date || !draft.time) {
      setError("Choisissez un jour et un horaire.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api.createReservation({
        date: draft.date,
        time: draft.time,
        partySize: draft.party,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        notes: draft.notes,
        website: draft.website,
      });
      setDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réservation impossible.");
    } finally {
      setBusy(false);
    }
  };

  const lastDate = config ? addDays(config.today, config.horizonDays) : "";
  const midi = slots.filter((s) => s.service === "midi");
  const soir = slots.filter((s) => s.service === "soir");

  return (
    <>
      <button type="button" className="book-fab" onClick={open}>
        <span>Réserver</span>
        <em>une table</em>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="book-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button type="button" className="book-backdrop" onClick={close} aria-label="Fermer" />
            <motion.aside
              className="book-panel"
              role="dialog"
              aria-labelledby="book-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="book-head">
                <div>
                  <span className="section-label">Une table face au port</span>
                  <h2 id="book-title" className="script">
                    Réserver
                  </h2>
                </div>
                <button type="button" className="book-close" onClick={close}>
                  Fermer
                </button>
              </header>

              <div
                className="book-body"
                data-lenis-prevent
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
              >
              {done ? (
                <div className="book-success">
                  <p className="script">C’est noté</p>
                  <p>
                    Table retenue le {formatLongDate(done.reservation.date)} à{" "}
                    {formatTime(done.reservation.time)}, pour {done.reservation.partySize}{" "}
                    couvert{done.reservation.partySize > 1 ? "s" : ""}.
                  </p>
                  <p className="book-code">Confirmation {done.reservation.code}</p>
                  <p className="book-mail">
                    {done.emailSent
                      ? "Un e-mail de confirmation vient de partir."
                      : "Notez bien ce numéro : l’e-mail n’a pas pu partir automatiquement."}
                  </p>
                  <button
                    type="button"
                    className="book-submit"
                    onClick={() => {
                      reset();
                      close();
                    }}
                  >
                    Parfait
                  </button>
                </div>
              ) : (
                <form className="book-form" onSubmit={submit}>
                  <fieldset className="book-party">
                    <legend>Couverts</legend>
                    <div>
                      {Array.from({ length: config?.maxParty ?? 8 }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={draft.party === n ? "is-on" : ""}
                          onClick={() => {
                            setDraft((prev) => ({ ...prev, party: n, time: "" }));
                            setFocus(draft.date ? "time" : "date");
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p>Au-delà de {config?.maxParty ?? 8}, appelez le 02 97 50 09 81.</p>
                  </fieldset>

                  <div className="book-cal" ref={calRef}>
                    <div className="book-cal-nav">
                      <button
                        type="button"
                        onClick={() => setCursor(addDays(`${cursor}-01`, -1).slice(0, 7))}
                        aria-label="Mois précédent"
                      >
                        ‹
                      </button>
                      <strong>{monthLabel(`${cursor}-01`)}</strong>
                      <button
                        type="button"
                        onClick={() => setCursor(addDays(`${cursor}-01`, 32).slice(0, 7))}
                        aria-label="Mois suivant"
                      >
                        ›
                      </button>
                    </div>
                    <div className="book-cal-grid">
                      {WEEKDAYS.map((d, i) => (
                        <span key={`${d}-${i}`} className="book-cal-wd">
                          {d}
                        </span>
                      ))}
                      {monthMatrix(`${cursor}-01`).map((day, i) => {
                        if (!day) return <span key={`e-${i}`} />;
                        const disabled =
                          !config ||
                          day < config.today ||
                          day > lastDate ||
                          config.closedWeekdays.includes(weekdayOf(day));
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={disabled}
                            className={draft.date === day ? "is-on" : ""}
                            onClick={() => {
                              setDraft((prev) => ({ ...prev, date: day, time: "" }));
                              setFocus("time");
                            }}
                          >
                            {Number(day.slice(-2))}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {draft.date && (
                    <div className="book-slots" ref={slotsRef}>
                      <p className="book-slots-label">{formatLongDate(draft.date)}</p>
                      {loadingSlots && <p className="book-hint">Chargement des créneaux…</p>}
                      {closedDay && (
                        <p className="book-hint">La Marine est fermée ce jour-là.</p>
                      )}
                      {!loadingSlots && !closedDay && (
                        <>
                          <SlotGroup
                            title="Midi"
                            slots={midi}
                            selected={draft.time}
                            onPick={(time) => {
                              setDraft((prev) => ({ ...prev, time }));
                              setFocus("contact");
                            }}
                          />
                          <SlotGroup
                            title="Soir"
                            slots={soir}
                            selected={draft.time}
                            onPick={(time) => {
                              setDraft((prev) => ({ ...prev, time }));
                              setFocus("contact");
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {draft.time && (
                    <div className="book-contact" ref={contactRef}>
                      <label>
                        <span>Nom</span>
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                          required
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        <span>Téléphone</span>
                        <input
                          value={draft.phone}
                          onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                          required
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </label>
                      <label>
                        <span>E-mail</span>
                        <input
                          type="email"
                          value={draft.email}
                          onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          autoComplete="email"
                        />
                      </label>
                      <label>
                        <span>Une envie, une allergie ?</span>
                        <textarea
                          rows={2}
                          value={draft.notes}
                          onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                      </label>
                      <label className="book-hp" aria-hidden>
                        Site web
                        <input
                          tabIndex={-1}
                          autoComplete="off"
                          value={draft.website}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, website: e.target.value }))
                          }
                        />
                      </label>
                      <p className="book-recap">
                        {draft.party} couvert{draft.party > 1 ? "s" : ""} ·{" "}
                        {formatLongDate(draft.date)} · {formatTime(draft.time)}
                      </p>
                      <button type="submit" className="book-submit" disabled={busy}>
                        {busy ? "Enregistrement…" : "Confirmer la table"}
                      </button>
                    </div>
                  )}

                  {error && <p className="book-error">{error}</p>}
                </form>
              )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SlotGroup({
  title,
  slots,
  selected,
  onPick,
}: {
  title: string;
  slots: BookingSlot[];
  selected: string;
  onPick: (time: string) => void;
}) {
  const open = slots.filter((s) => s.state === "open");
  const allPast = slots.length > 0 && slots.every((s) => s.state === "past");
  return (
    <div className="book-slot-group">
      <span>{title}</span>
      {open.length === 0 ? (
        <p>{allPast ? "Service terminé" : "Complet"}</p>
      ) : (
        <div>
          {open.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={selected === slot.time ? "is-on" : ""}
              onClick={() => onPick(slot.time)}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
