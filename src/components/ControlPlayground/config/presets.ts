import { controller } from "../model/defaults";
import { type Config } from "../model/types";
export const presets: Record<
  string,
  { label: string; config: Partial<Config> }
> = {
  p: { label: "בקר P", config: { a: { ...controller, i: false, d: false } } },
  pi: { label: "בקר PI", config: { a: { ...controller, d: false } } },
  pd: { label: "בקר PD", config: { a: { ...controller, i: false } } },
  tuned: { label: "PID מכוון", config: {} },
  oscillation: {
    label: "תנודות • P חזק",
    config: {
      a: { ...controller, kp: 25, i: false, d: false },
      b: { ...controller },
    },
  },
  windup: {
    label: "רוויה וצבירת אינטגרל",
    config: {
      limit: 3,
      a: { ...controller, kp: 8, ki: 12, kd: 1, antiWindup: false },
      b: { ...controller, kp: 8, ki: 12, kd: 1, antiWindup: true },
    },
  },
  gravity: {
    label: "פיצוי כבידה",
    config: {
      mechanism: "arm",
      target: 0.8,
      a: { ...controller, i: false },
      b: { ...controller, method: "combined", i: false },
    },
  },
  flywheel: {
    label: "גלגל ירי • Bang-Bang מול PID",
    config: {
      mechanism: "wheel",
      request: "velocity",
      target: 8,
      a: { ...controller, method: "bang" },
      b: { ...controller, method: "combined", kp: 2, ki: 2, kd: 0 },
    },
  },
  profiles: {
    label: "טרפז מול S-curve",
    config: {
      graphs: ["response", "velocity", "acceleration", "output"],
      a: { ...controller, method: "profile" },
      b: { ...controller, method: "profile", profile: "scurve" },
    },
  },
  direct: {
    label: "יעד מיידי מול פרופיל",
    config: { a: { ...controller }, b: { ...controller, method: "profile" } },
  },
  open: {
    label: "מתח קבוע בחוג פתוח",
    config: {
      request: "voltage",
      demand: 3,
      graphs: ["output", "velocity"],
      a: { ...controller, method: "open" },
    },
  },
  feedforward: {
    label: "Feedforward מול משוב משולב",
    config: {
      mechanism: "wheel",
      request: "velocity",
      target: 8,
      a: { ...controller, method: "ff" },
      b: { ...controller, method: "combined" },
    },
  },
};
export const presetDescriptions: Record<string, string> = {
  p: "מעלית עם P בלבד: בדקו אם היא מצליחה להחזיק את הגובה תחת כבידה, ומה קורה כשמגדילים את ההגבר.",
  pi: "מעלית עם P ו־I: צבירת השגיאה עוזרת להתגבר על עומס קבוע. בדקו כמה זמן נדרש להתייצבות.",
  pd: "מעלית עם P ו־D: הנגזרת מרסנת תנודות, אך אינה מבטלת לבדה שגיאה קבועה תחת עומס.",
  tuned:
    "נקודת פתיחה למעלית עם PID. הפעילו, שנו את היעד ובדקו את זמן ההתייצבות ואת השגיאה שנותרה.",
  oscillation:
    "משווים מעלית עם P חזק ללא ריסון לבקר PID. חפשו חריגה מעבר ליעד ותנודות בגרף.",
  windup:
    "שני בקרי מעלית זהים מוגבלים ל־3 וולט. רק השני מונע צבירת אינטגרל ברוויה. השוו את ההתאוששות.",
  gravity:
    "שתי זרועות: בקר PD לעומת PD עם פיצוי כבידה. בדקו מי שומר על הזווית עם פחות שגיאה.",
  flywheel:
    "שני גלגלי ירי: Bang-Bang לעומת PID עם Feedforward. הפעילו הפרעה והשוו את המיתוג ואת החזרה למהירות.",
  profiles:
    "שתי מעליות עם אותו יעד: פרופיל טרפז לעומת S-curve. השוו את גרפי התאוצה ואת זמן ההתייצבות.",
  direct:
    "שתי מעליות: יעד מיידי לעומת יעדי ביניים מפרופיל. בדקו איך הגבלת התנועה משנה את הפלט ואת זמן ההגעה.",
  open: "מעלית שמקבלת מתח קבוע. הפעילו הפרעה ובדקו מדוע אין תיקון של המהירות או המיקום. הפלט ינותק בתום זמן ההפעלה.",
  feedforward:
    "גלגל ירי עם Feedforward בלבד מול PID עם Feedforward. הפעילו הפרעה ובדקו מי מתקן את שגיאת המהירות.",
};
// Comparison is a property of a teaching experiment, not a separate UI mode.
for (const preset of Object.values(presets))
  if (preset.config.b) preset.config.compare = true;
