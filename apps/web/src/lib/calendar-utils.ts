import {
  format,
  addMinutes,
  setHours,
  setMinutes,
  isBefore,
  startOfDay,
  isSameDay,
} from "date-fns";

export interface TimeSlot {
  time: string;
  datetime: Date;
  available: boolean;
}

export interface BusinessHours {
  start: number;
  end: number;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  start: 9,
  end: 18,
};

export const SLOT_DURATION_MINUTES = 20;

export function formatTime(date: Date, format24h: boolean): string {
  return format24h
    ? format(date, "HH:mm")
    : format(date, "h:mma").toLowerCase();
}

export function generateTimeSlots(
  selectedDate: Date,
  format24h: boolean,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const isToday = isSameDay(selectedDate, now);

  let currentSlot = setMinutes(setHours(selectedDate, businessHours.start), 0);
  const endTime = setHours(selectedDate, businessHours.end);

  while (isBefore(currentSlot, endTime)) {
    const isPast = isToday && isBefore(currentSlot, now);
    const isAvailable = !isPast && Math.random() > 0.3;

    slots.push({
      time: formatTime(currentSlot, format24h),
      datetime: new Date(currentSlot),
      available: isAvailable,
    });

    currentSlot = addMinutes(currentSlot, SLOT_DURATION_MINUTES);
  }

  return slots;
}

export function isSlotAvailable(datetime: Date): boolean {
  const now = new Date();
  if (isBefore(datetime, now)) {
    return false;
  }
  return Math.random() > 0.3;
}

export function getAvailableSlots(
  selectedDate: Date,
  format24h: boolean,
): TimeSlot[] {
  return generateTimeSlots(selectedDate, format24h).filter(
    (slot) => slot.available,
  );
}

export function isPastDate(date: Date): boolean {
  const today = startOfDay(new Date());
  return isBefore(startOfDay(date), today);
}

export const TIMEZONES = [
  { value: "Europe/Moscow", label: "Europe/Moscow" },
  { value: "America/New_York", label: "America/New York" },
  { value: "America/Los_Angeles", label: "America/Los Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];
