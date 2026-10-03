import { randomBytes } from "node:crypto";
import db from "./db.js";

export const SERVICES = {
  midi: { label: "Midi", slotsKey: "lunchSlots", capacityKey: "lunchCapacity" },
  soir: { label: "Soir", slotsKey: "dinnerSlots", capacityKey: "dinnerCapacity" },
};

export const DEFAULT_SETTINGS = {
  lunchSlots: ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30"],
  dinnerSlots: ["19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00"],
  lunchCapacity: 40,
  dinnerCapacity: 40,
  slotCapacity: 12,
  minParty: 1,
  maxParty: 8,
  horizonDays: 60,
  minNoticeMinutes: 45,
  closedWeekdays: [],
};

const WEEKDAY_FROM_NAME = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'booking'").get();
  if (!row) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial) {
  const next = { ...getSettings(), ...partial };
  db.prepare(
    `INSERT INTO settings (key, value) VALUES ('booking', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(JSON.stringify(next));
  return next;
}

/* ---------- temps à Paris : Railway est en UTC ---------- */

export function todayParis() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function nowMinutesParis() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function weekdayParis(dateStr) {
  const instant = new Date(`${dateStr}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    weekday: "short",
  }).format(instant);
  return WEEKDAY_FROM_NAME[name] ?? 0;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
}

export function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

export function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function serviceOfTime(time, settings = getSettings()) {
  if (settings.lunchSlots.includes(time)) return "midi";
  if (settings.dinnerSlots.includes(time)) return "soir";
  return null;
}

export function publicConfig() {
  const settings = getSettings();
  return {
    minParty: settings.minParty,
    maxParty: settings.maxParty,
    horizonDays: settings.horizonDays,
    closedWeekdays: settings.closedWeekdays,
    today: todayParis(),
    services: [
      { id: "midi", label: SERVICES.midi.label, slots: settings.lunchSlots },
      { id: "soir", label: SERVICES.soir.label, slots: settings.dinnerSlots },
    ],
  };
}

function mapReservation(row) {
  return {
    id: row.id,
    code: row.code,
    date: row.date,
    time: row.time,
    service: row.service,
    partySize: row.party_size,
    name: row.name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
  };
}

export function reservationsOn(date, { includeCancelled = false } = {}) {
  const sql = includeCancelled
    ? "SELECT * FROM reservations WHERE date = ? ORDER BY time, id"
    : "SELECT * FROM reservations WHERE date = ? AND status = 'confirmed' ORDER BY time, id";
  return db.prepare(sql).all(date).map(mapReservation);
}

export function blocksOn(date) {
  return db
    .prepare("SELECT * FROM slot_blocks WHERE date = ? ORDER BY service, time, id")
    .all(date)
    .map((row) => ({
      id: row.id,
      date: row.date,
      service: row.service,
      time: row.time,
      reason: row.reason,
    }));
}

function slotState({ date, time, service, party, settings, reservations, blocks }) {
  const today = todayParis();
  if (date < today) return { state: "past", remaining: 0 };
  if (date === today) {
    const cutoff = nowMinutesParis() + settings.minNoticeMinutes;
    if (timeToMinutes(time) < cutoff) return { state: "past", remaining: 0 };
  }

  const dayBlocked = blocks.some((b) => !b.service && !b.time);
  const serviceBlocked = blocks.some((b) => b.service === service && !b.time);
  const timeBlocked = blocks.some((b) => b.service === service && b.time === time);
  if (dayBlocked || serviceBlocked || timeBlocked) {
    return { state: "blocked", remaining: 0 };
  }

  const serviceCapacity = settings[SERVICES[service].capacityKey];
  const serviceUsed = reservations
    .filter((r) => r.service === service && r.status === "confirmed")
    .reduce((sum, r) => sum + r.partySize, 0);
  const slotUsed = reservations
    .filter((r) => r.service === service && r.time === time && r.status === "confirmed")
    .reduce((sum, r) => sum + r.partySize, 0);

  const remaining = Math.min(
    Math.max(0, serviceCapacity - serviceUsed),
    Math.max(0, settings.slotCapacity - slotUsed)
  );

  if (remaining < party) return { state: "full", remaining };
  return { state: "open", remaining };
}

export function availability(date, party) {
  const settings = getSettings();
  const reservations = reservationsOn(date);
  const blocks = blocksOn(date);
  const closed = settings.closedWeekdays.includes(weekdayParis(date));

  const slotsFor = (service) => {
    const times = settings[SERVICES[service].slotsKey];
    if (closed) {
      return times.map((time) => ({ time, service, remaining: 0, state: "blocked" }));
    }
    return times.map((time) => ({
      time,
      service,
      ...slotState({ date, time, service, party, settings, reservations, blocks }),
    }));
  };

  return {
    date,
    party,
    closed,
    slots: [...slotsFor("midi"), ...slotsFor("soir")],
  };
}

export function dayOverview(date) {
  const settings = getSettings();
  const reservations = reservationsOn(date, { includeCancelled: true });
  const blocks = blocksOn(date);
  const closed = settings.closedWeekdays.includes(weekdayParis(date));
  const dayBlocked = blocks.some((b) => !b.service && !b.time);

  const buildService = (service) => {
    const confirmed = reservations.filter((r) => r.service === service && r.status === "confirmed");
    const covers = confirmed.reduce((sum, r) => sum + r.partySize, 0);
    const capacity = settings[SERVICES[service].capacityKey];
    const serviceBlocked = blocks.some((b) => b.service === service && !b.time);
    const slots = settings[SERVICES[service].slotsKey].map((time) => {
      const { state, remaining } = slotState({
        date,
        time,
        service,
        party: 1,
        settings,
        reservations: confirmed,
        blocks,
      });
      return {
        time,
        remaining,
        state,
        reservations: reservations.filter((r) => r.service === service && r.time === time),
      };
    });
    return {
      id: service,
      label: SERVICES[service].label,
      capacity,
      covers,
      remaining: Math.max(0, capacity - covers),
      blocked: closed || dayBlocked || serviceBlocked,
      slots,
    };
  };

  return {
    date,
    closed,
    dayBlocked,
    settings: {
      lunchCapacity: settings.lunchCapacity,
      dinnerCapacity: settings.dinnerCapacity,
      slotCapacity: settings.slotCapacity,
      minParty: settings.minParty,
      maxParty: settings.maxParty,
      horizonDays: settings.horizonDays,
      closedWeekdays: settings.closedWeekdays,
    },
    blocks,
    midi: buildService("midi"),
    soir: buildService("soir"),
  };
}

function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const roll = () =>
    "LM-" +
    Array.from({ length: 4 }, () => alphabet[randomBytes(1)[0] % alphabet.length]).join("");
  for (let i = 0; i < 8; i += 1) {
    const code = roll();
    if (!db.prepare("SELECT 1 FROM reservations WHERE code = ?").get(code)) return code;
  }
  return `LM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function parseBooking(body, { admin = false } = {}) {
  const settings = getSettings();
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const partySize = Number(body.partySize ?? body.party_size);

  if (!isValidDate(date)) throw new Error("La date est invalide.");
  if (!isValidTime(time)) throw new Error("L’horaire est invalide.");
  if (!name || name.length < 2) throw new Error("Le nom est obligatoire.");
  if (!phone || phone.replace(/\D/g, "").length < 8) {
    throw new Error("Un numéro de téléphone valide est obligatoire.");
  }
  if (!admin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Une adresse e-mail valide est obligatoire.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("L’adresse e-mail n’est pas valide.");
  }
  if (!Number.isInteger(partySize) || partySize < settings.minParty) {
    throw new Error("Le nombre de couverts est invalide.");
  }
  if (partySize > settings.maxParty) {
    throw new Error(
      `Les tables de plus de ${settings.maxParty} couverts se réservent par téléphone au 02 97 50 09 81.`
    );
  }
  if (notes.length > 400) throw new Error("Le message est trop long (400 caractères).");

  const today = todayParis();
  if (date < today) throw new Error("Impossible de réserver un jour passé.");
  if (date > addDays(today, settings.horizonDays)) {
    throw new Error(`Les réservations s’ouvrent ${settings.horizonDays} jours à l’avance.`);
  }

  const service = serviceOfTime(time, settings);
  if (!service) throw new Error("Ce créneau n’existe pas.");

  return {
    date,
    time,
    service,
    partySize,
    name,
    email,
    phone,
    notes,
    source: admin ? "phone" : "web",
  };
}

export function createReservation(input) {
  const book = db.transaction((payload) => {
    const { slots } = availability(payload.date, payload.partySize);
    const slot = slots.find((s) => s.time === payload.time);
    if (!slot || slot.state !== "open") {
      throw new Error("Ce créneau n’est plus disponible.");
    }
    const code = newCode();
    const info = db
      .prepare(
        `INSERT INTO reservations
          (code, date, time, service, party_size, name, email, phone, notes, source)
         VALUES
          (@code, @date, @time, @service, @partySize, @name, @email, @phone, @notes, @source)`
      )
      .run({ ...payload, code });
    return mapReservation(db.prepare("SELECT * FROM reservations WHERE id = ?").get(info.lastInsertRowid));
  });
  return book(input);
}

export function cancelReservation(id) {
  const existing = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id);
  if (!existing) return null;
  if (existing.status === "cancelled") return mapReservation(existing);
  db.prepare(
    "UPDATE reservations SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?"
  ).run(id);
  return mapReservation(db.prepare("SELECT * FROM reservations WHERE id = ?").get(id));
}

export function addBlock({ date, service = null, time = null, reason = "" }) {
  if (!isValidDate(date)) throw new Error("La date est invalide.");
  if (service && !SERVICES[service]) throw new Error("Service inconnu.");
  if (time && !isValidTime(time)) throw new Error("L’horaire est invalide.");
  if (time && !service) throw new Error("Un créneau bloqué doit appartenir à un service.");
  const info = db
    .prepare(
      `INSERT INTO slot_blocks (date, service, time, reason) VALUES (?, ?, ?, ?)`
    )
    .run(date, service, time, String(reason ?? "").trim());
  return db.prepare("SELECT * FROM slot_blocks WHERE id = ?").get(info.lastInsertRowid);
}

export function removeBlock(id) {
  const info = db.prepare("DELETE FROM slot_blocks WHERE id = ?").run(id);
  return info.changes > 0;
}

export function upcomingCounts(from, days = 14) {
  const end = addDays(from, days);
  const rows = db
    .prepare(
      `SELECT date, service, COALESCE(SUM(party_size), 0) AS covers, COUNT(*) AS tables
       FROM reservations
       WHERE status = 'confirmed' AND date >= ? AND date < ?
       GROUP BY date, service`
    )
    .all(from, end);
  const byDate = {};
  for (let i = 0; i < days; i += 1) {
    const date = addDays(from, i);
    byDate[date] = { date, midi: 0, soir: 0, tables: 0 };
  }
  for (const row of rows) {
    if (!byDate[row.date]) continue;
    byDate[row.date][row.service] = row.covers;
    byDate[row.date].tables += row.tables;
  }
  return Object.values(byDate);
}
