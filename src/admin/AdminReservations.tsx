import { useCallback, useEffect, useState } from "react";
import * as api from "../api/client";
import type { BookingService, DayOverview, Reservation } from "../api/types";
import { addDays, formatLongDate, formatTime, todayParis } from "../reservations/dates";
import "./AdminReservations.css";

const WEEKDAYS = [
  { id: 1, label: "Lun" },
  { id: 2, label: "Mar" },
  { id: 3, label: "Mer" },
  { id: 4, label: "Jeu" },
  { id: 5, label: "Ven" },
  { id: 6, label: "Sam" },
  { id: 0, label: "Dim" },
];

export default function AdminReservations({
  onFlash,
}: {
  onFlash: (message: string) => void;
}) {
  const [date, setDate] = useState(todayParis);
  const [day, setDay] = useState<DayOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async (target = date) => {
    try {
      const next = await api.adminDay(target);
      setDay(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const block = async (service: BookingService | null, time: string | null, label: string) => {
    if (!window.confirm(`Bloquer ${label} ? Les réservations déjà prises restent affichées.`)) return;
    try {
      await api.adminAddBlock({ date, service, time });
      await load();
      onFlash(`${label} est désormais indisponible en ligne.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blocage impossible.");
    }
  };

  const unblock = async (id: number) => {
    try {
      await api.adminRemoveBlock(id);
      await load();
      onFlash("Créneau de nouveau ouvert.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rouvrir.");
    }
  };

  const cancel = async (reservation: Reservation) => {
    if (!window.confirm(`Annuler la table de ${reservation.name} (${reservation.code}) ?`)) return;
    try {
      await api.adminCancelReservation(reservation.id);
      await load();
      onFlash(`La réservation ${reservation.code} a été annulée.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Annulation impossible.");
    }
  };

  if (loading && !day) return <p className="admin-loading">Chargement du livre de réservations…</p>;

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Les réservations</h2>
          <p>
            Vue du service, blocage d’un créneau ou d’une soirée, annulation d’une
            table. Les clients voient immédiatement les horaires encore ouverts.
          </p>
        </div>
        <div className="rsv-head-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setSettingsOpen((v) => !v)}>
            Capacités
          </button>
          <button type="button" className="admin-btn admin-btn--gold" onClick={() => setFormOpen((v) => !v)}>
            + Table au téléphone
          </button>
        </div>
      </div>

      {error && <p className="admin-inline-error">{error}</p>}

      <div className="rsv-daynav">
        <button type="button" className="admin-btn admin-btn--quiet" onClick={() => setDate(addDays(date, -1))}>
          ← Veille
        </button>
        <div>
          <strong>{formatLongDate(date)}</strong>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="button" className="admin-btn admin-btn--quiet" onClick={() => setDate(addDays(date, 1))}>
          Lendemain →
        </button>
      </div>

      {day && (
        <div className="rsv-strip">
          {day.upcoming.slice(0, 7).map((item) => (
            <button
              key={item.date}
              type="button"
              className={item.date === date ? "is-on" : ""}
              onClick={() => setDate(item.date)}
            >
              <span>
                {new Date(`${item.date}T12:00:00Z`).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                })}
              </span>
              <strong>{item.midi + item.soir}</strong>
            </button>
          ))}
        </div>
      )}

      {day && (
        <>
          <ul className="rsv-occupancy">
            <li>
              <em>Midi</em>
              <strong>
                {day.midi.covers}
                <small> / {day.midi.capacity}</small>
              </strong>
              <span className="rsv-bar">
                <i style={{ width: `${Math.min(100, (day.midi.covers / day.midi.capacity) * 100)}%` }} />
              </span>
            </li>
            <li>
              <em>Soir</em>
              <strong>
                {day.soir.covers}
                <small> / {day.soir.capacity}</small>
              </strong>
              <span className="rsv-bar">
                <i style={{ width: `${Math.min(100, (day.soir.covers / day.soir.capacity) * 100)}%` }} />
              </span>
            </li>
          </ul>

          <div className="rsv-block-row">
            {day.dayBlocked ? (
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => {
                  const blockRow = day.blocks.find((b) => !b.service && !b.time);
                  if (blockRow) void unblock(blockRow.id);
                }}
              >
                Rouvrir la journée
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={() => void block(null, null, "toute la journée")}
              >
                Fermer la journée
              </button>
            )}
            {day.closed && <span className="admin-tag">Jour de fermeture habituel</span>}
          </div>

          {formOpen && (
            <PhoneForm
              date={date}
              onCancel={() => setFormOpen(false)}
              onSaved={async (name) => {
                setFormOpen(false);
                await load();
                onFlash(`Table de ${name} ajoutée au livre.`);
              }}
            />
          )}

          {settingsOpen && day && (
            <SettingsForm
              initial={day.settings}
              onCancel={() => setSettingsOpen(false)}
              onSaved={async () => {
                setSettingsOpen(false);
                await load();
                onFlash("Capacités mises à jour.");
              }}
            />
          )}

          <div className="rsv-services">
            <ServiceColumn
              service={day.midi}
              onBlock={(time, label) => void block("midi", time, label)}
              onUnblockService={() => {
                const row = day.blocks.find((b) => b.service === "midi" && !b.time);
                if (row) void unblock(row.id);
              }}
              onBlockService={() => void block("midi", null, "tout le service du midi")}
              onUnblockSlot={(id) => void unblock(id)}
              onCancel={cancel}
              blocks={day.blocks}
            />
            <ServiceColumn
              service={day.soir}
              onBlock={(time, label) => void block("soir", time, label)}
              onUnblockService={() => {
                const row = day.blocks.find((b) => b.service === "soir" && !b.time);
                if (row) void unblock(row.id);
              }}
              onBlockService={() => void block("soir", null, "tout le service du soir")}
              onUnblockSlot={(id) => void unblock(id)}
              onCancel={cancel}
              blocks={day.blocks}
            />
          </div>
        </>
      )}
    </section>
  );
}

function ServiceColumn({
  service,
  onBlock,
  onBlockService,
  onUnblockService,
  onUnblockSlot,
  onCancel,
  blocks,
}: {
  service: DayOverview["midi"];
  onBlock: (time: string | null, label: string) => void;
  onBlockService: () => void;
  onUnblockService: () => void;
  onUnblockSlot: (id: number) => void;
  onCancel: (reservation: Reservation) => void;
  blocks: DayOverview["blocks"];
}) {
  return (
    <div className="rsv-col">
      <header>
        <h3>{service.label}</h3>
        <em>
          {service.covers} / {service.capacity} couverts
        </em>
        {service.blocked ? (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onUnblockService}>
            Rouvrir
          </button>
        ) : (
          <button type="button" className="admin-btn admin-btn--quiet" onClick={onBlockService}>
            Complet
          </button>
        )}
      </header>

      <ul>
        {service.slots.map((slot) => {
          const slotBlock = blocks.find((b) => b.service === service.id && b.time === slot.time);
          const live = slot.reservations.filter((r) => r.status === "confirmed");
          return (
            <li key={slot.time} className={slot.state !== "open" ? "is-dim" : ""}>
              <div className="rsv-slot-head">
                <strong>{formatTime(slot.time)}</strong>
                <span>{slot.remaining} places</span>
                {slotBlock ? (
                  <button type="button" className="admin-btn admin-btn--quiet" onClick={() => onUnblockSlot(slotBlock.id)}>
                    Rouvrir
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-btn admin-btn--quiet"
                    onClick={() => onBlock(slot.time, `${formatTime(slot.time)} (${service.label.toLowerCase()})`)}
                  >
                    Bloquer
                  </button>
                )}
              </div>
              {live.length === 0 ? (
                <p className="rsv-empty">Aucune table</p>
              ) : (
                live.map((reservation) => (
                  <article key={reservation.id} className="rsv-card">
                    <div>
                      <h4>
                        {reservation.name}
                        <small>{reservation.code}</small>
                      </h4>
                      <p>
                        {reservation.partySize} couvert{reservation.partySize > 1 ? "s" : ""} · {reservation.phone}
                        {reservation.email ? ` · ${reservation.email}` : ""}
                      </p>
                      {reservation.notes && <p className="rsv-notes">{reservation.notes}</p>}
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      onClick={() => onCancel(reservation)}
                    >
                      Annuler
                    </button>
                  </article>
                ))
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PhoneForm({
  date,
  onCancel,
  onSaved,
}: {
  date: string;
  onCancel: () => void;
  onSaved: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("19:30");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.adminCreateReservation({ date, time, partySize, name, phone, email, notes });
      await onSaved(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <header className="admin-form-head">
        <h3>Noter une table (téléphone)</h3>
        <button type="button" className="admin-btn admin-btn--quiet" onClick={onCancel}>
          Fermer
        </button>
      </header>
      <div className="admin-field">
        <span className="admin-label">Nom</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="admin-field">
        <span className="admin-label">Téléphone</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="admin-field">
        <span className="admin-label">E-mail (optionnel)</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="admin-field">
        <span className="admin-label">Couverts</span>
        <input
          type="number"
          min={1}
          max={12}
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value))}
        />
      </div>
      <div className="admin-field">
        <span className="admin-label">Horaire</span>
        <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:30" />
      </div>
      <div className="admin-field">
        <span className="admin-label">Note</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <p className="admin-inline-error">{error}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--gold" disabled={busy}>
          {busy ? "Enregistrement…" : "Ajouter au livre"}
        </button>
      </div>
    </form>
  );
}

function SettingsForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: DayOverview["settings"];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [lunchCapacity, setLunch] = useState(initial.lunchCapacity);
  const [dinnerCapacity, setDinner] = useState(initial.dinnerCapacity);
  const [slotCapacity, setSlot] = useState(initial.slotCapacity);
  const [maxParty, setMax] = useState(initial.maxParty);
  const [closed, setClosed] = useState<number[]>(initial.closedWeekdays);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleDay = (id: number) => {
    setClosed((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.adminBookingSettings({ lunchCapacity, dinnerCapacity, slotCapacity, maxParty, closedWeekdays: closed });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <header className="admin-form-head">
        <h3>Capacité de la salle</h3>
        <button type="button" className="admin-btn admin-btn--quiet" onClick={onCancel}>
          Fermer
        </button>
      </header>
      <div className="admin-field">
        <span className="admin-label">Couverts midi</span>
        <input type="number" min={1} value={lunchCapacity} onChange={(e) => setLunch(Number(e.target.value))} />
      </div>
      <div className="admin-field">
        <span className="admin-label">Couverts soir</span>
        <input type="number" min={1} value={dinnerCapacity} onChange={(e) => setDinner(Number(e.target.value))} />
      </div>
      <div className="admin-field">
        <span className="admin-label">Couverts max par horaire</span>
        <input type="number" min={1} value={slotCapacity} onChange={(e) => setSlot(Number(e.target.value))} />
      </div>
      <div className="admin-field">
        <span className="admin-label">Taille max d’une table en ligne</span>
        <input type="number" min={1} value={maxParty} onChange={(e) => setMax(Number(e.target.value))} />
      </div>
      <div className="admin-field">
        <span className="admin-label">Fermeture hebdomadaire</span>
        <div className="rsv-days">
          {WEEKDAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={closed.includes(day.id) ? "is-on" : ""}
              onClick={() => toggleDay(day.id)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="admin-inline-error">{error}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--gold" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
