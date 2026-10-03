export type Category = {
  slug: string;
  label: string;
  script: string;
};

export type Dish = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  featured: boolean;
  visible: boolean;
  position: number;
};

export type Cocktail = {
  id: number;
  name: string;
  recipe: string;
  price: string;
  image: string | null;
  featured: boolean;
  visible: boolean;
  position: number;
};

export type Admin = {
  email: string;
  name: string;
};

export type BookingService = "midi" | "soir";

export type SlotState = "open" | "full" | "blocked" | "past";

export type BookingSlot = {
  time: string;
  service: BookingService;
  remaining: number;
  state: SlotState;
};

export type BookingConfig = {
  minParty: number;
  maxParty: number;
  horizonDays: number;
  closedWeekdays: number[];
  today: string;
  services: { id: BookingService; label: string; slots: string[] }[];
};

export type Reservation = {
  id: number;
  code: string;
  date: string;
  time: string;
  service: BookingService;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "confirmed" | "cancelled";
  source: "web" | "phone";
  createdAt: string;
  cancelledAt: string | null;
};

export type DaySlot = {
  time: string;
  remaining: number;
  state: SlotState;
  reservations: Reservation[];
};

export type DayService = {
  id: BookingService;
  label: string;
  capacity: number;
  covers: number;
  remaining: number;
  blocked: boolean;
  slots: DaySlot[];
};

export type SlotBlock = {
  id: number;
  date: string;
  service: BookingService | null;
  time: string | null;
  reason: string;
};

export type BookingSettings = {
  lunchCapacity: number;
  dinnerCapacity: number;
  slotCapacity: number;
  minParty: number;
  maxParty: number;
  horizonDays: number;
  closedWeekdays: number[];
};

export type DayOverview = {
  date: string;
  closed: boolean;
  dayBlocked: boolean;
  settings: BookingSettings;
  blocks: SlotBlock[];
  midi: DayService;
  soir: DayService;
  upcoming: { date: string; midi: number; soir: number; tables: number }[];
};

