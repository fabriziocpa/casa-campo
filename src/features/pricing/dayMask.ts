export const DOW = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
} as const;

export const maskOf = (...days: number[]) =>
  days.reduce((m, d) => m | (1 << d), 0);

export const maskHas = (mask: number, dow: number) =>
  (mask & (1 << dow)) !== 0;

export const PRESETS = {
  MON_THU:    maskOf(1, 2, 3, 4),        // 30
  FRI_SAT_SUN: maskOf(5, 6, 0),          // 97
  MON_FRI:    maskOf(1, 2, 3, 4, 5),     // 62
  SAT_SUN:    maskOf(6, 0),              // 65
  ALL_WEEK:   maskOf(0, 1, 2, 3, 4, 5, 6), // 127
} as const;

export function labelForMask(mask: number): string {
  switch (mask) {
    case PRESETS.MON_THU:     return "Lun a Jue";
    case PRESETS.FRI_SAT_SUN: return "Vie, Sáb y Dom";
    case PRESETS.MON_FRI:     return "Lun a Vie";
    case PRESETS.SAT_SUN:     return "Sáb y Dom";
    case PRESETS.ALL_WEEK:    return "Todos los días";
    default: {
      const names = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const days: string[] = [];
      for (let d = 0; d < 7; d++) if (maskHas(mask, d)) days.push(names[d]);
      return days.join(", ");
    }
  }
}
