export type MarketStatus = {
  isOpen: boolean;
  label: "OPEN" | "CLOSED";
};

function toNyParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes, fallback = "0") =>
    parts.find((p) => p.type === type)?.value ?? fallback;

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday", "Mon"),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function observedDate(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dow = d.getUTCDay();
  if (dow === 6) return `${year}-${String(month).padStart(2, "0")}-${String(day - 1).padStart(2, "0")}`;
  if (dow === 0) return `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}`;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): number {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - first + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): number {
  const lastDate = new Date(Date.UTC(year, month, 0));
  const lastDow = lastDate.getUTCDay();
  const offset = (lastDow - weekday + 7) % 7;
  return lastDate.getUTCDate() - offset;
}

function easterUtc(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function goodFridayIso(year: number): string {
  const easter = easterUtc(year);
  const gf = new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000);
  return `${gf.getUTCFullYear()}-${String(gf.getUTCMonth() + 1).padStart(2, "0")}-${String(gf.getUTCDate()).padStart(2, "0")}`;
}

function nyseHolidaySet(year: number): Set<string> {
  const pad = (n: number) => String(n).padStart(2, "0");
  const mlk = nthWeekdayOfMonth(year, 1, 1, 3);
  const presidents = nthWeekdayOfMonth(year, 2, 1, 3);
  const memorial = lastWeekdayOfMonth(year, 5, 1);
  const juneteenth = observedDate(year, 6, 19);
  const independence = observedDate(year, 7, 4);
  const labor = nthWeekdayOfMonth(year, 9, 1, 1);
  const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4);
  const christmas = observedDate(year, 12, 25);

  return new Set([
    observedDate(year, 1, 1),
    `${year}-01-${pad(mlk)}`,
    `${year}-02-${pad(presidents)}`,
    goodFridayIso(year),
    `${year}-05-${pad(memorial)}`,
    juneteenth,
    independence,
    `${year}-09-${pad(labor)}`,
    `${year}-11-${pad(thanksgiving)}`,
    christmas,
  ]);
}

export function getUsMarketStatus(date: Date): MarketStatus {
  const ny = toNyParts(date);
  const isWeekend = ny.weekday === "Sat" || ny.weekday === "Sun";
  const iso = `${ny.year}-${String(ny.month).padStart(2, "0")}-${String(ny.day).padStart(2, "0")}`;
  const isHoliday = nyseHolidaySet(ny.year).has(iso);
  const inRegularHours = ny.minutes >= 570 && ny.minutes < 960; // 9:30-16:00 ET
  const isOpen = !isWeekend && !isHoliday && inRegularHours;

  return { isOpen, label: isOpen ? "OPEN" : "CLOSED" };
}
