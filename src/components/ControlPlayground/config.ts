/* global URLSearchParams */
import {
  defaults,
  controller,
  clamp,
  targetBounds,
  type Config,
  type Controller,
} from "./engine";
export const methods = {
  open: "חוג פתוח",
  pid: "משוב • P / PI / PD / PID",
  ff: "Feedforward",
  combined: "PID + Feedforward",
  bang: "Bang-Bang",
  profile: "פרופיל תנועה",
};
export const requests = {
  duty: "Duty Cycle — אחוזי עוצמה",
  voltage: "Voltage — מתח",
  velocity: "Velocity — מהירות",
  position: "Position — מיקום",
  torque: "Torque Current — זרם מומנט",
  magic: "Motion Magic — תנועה לפי פרופיל",
};
const numbers: Record<string, [number, number]> = {
  kp: [0, 30],
  ki: [0, 20],
  kd: [0, 12],
  ks: [0, 3],
  kv: [0, 4],
  ka: [0, 4],
  kg: [0, 6],
  output: [-12, 12],
  hysteresis: [0, 2],
  low: [-12, 12],
  high: [-12, 12],
  vmax: [0.1, 5],
  amax: [0.1, 10],
  jmax: [0.1, 40],
  stopAfter: [0.1, 60],
};
function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}
function number(v: unknown, fallback: number, lo: number, hi: number) {
  return typeof v === "number" && Number.isFinite(v)
    ? clamp(v, lo, hi)
    : fallback;
}
function control(v: unknown): Controller {
  const r = record(v),
    c = { ...controller };
  for (const k of Object.keys(numbers)) {
    const [lo, hi] = numbers[k];
    (c as unknown as Record<string, unknown>)[k] = number(
      r[k],
      Number(c[k as keyof Controller]),
      lo,
      hi,
    );
  }
  for (const k of ["p", "i", "d", "antiWindup"] as const)
    if (typeof r[k] === "boolean") c[k] = r[k];
  if (typeof r.method === "string" && Object.hasOwn(methods, r.method))
    c.method = r.method as Controller["method"];
  if (["direct", "trapezoid", "scurve"].includes(String(r.profile)))
    c.profile = r.profile as Controller["profile"];
  if (["auto", "none", "time", "target"].includes(String(r.stop)))
    c.stop = r.stop as Controller["stop"];
  return c;
}
export function validate(v: unknown): Config {
  const r = record(v),
    c: Config = {
      ...defaults,
      a: control(r.a ?? defaults.a),
      b: control(r.b ?? defaults.b),
      graphs: [...defaults.graphs],
    };
  if (["wheel", "arm", "elevator"].includes(String(r.mechanism)))
    c.mechanism = r.mechanism as Config["mechanism"];
  if (typeof r.request === "string" && Object.hasOwn(requests, r.request))
    c.request = r.request as Config["request"];
  if (typeof r.compare === "boolean") c.compare = r.compare;
  const ranges: Record<string, [number, number]> = {
    target: targetBounds(c) as [number, number],
    speed: [0.25, 4],
    limit: [1, 12],
    inertia: [0.2, 4],
    damping: [0, 3],
    friction: [0, 2],
    noise: [0, 0.1],
    disturbance: [-10, 10],
    demand: [-100, 100],
    battery: [6, 12],
    duration: [1, 60],
    tolerance: [0.005, 1],
    rateTolerance: [0.005, 2],
    dwell: [0.1, 3],
  };
  for (const k of Object.keys(ranges)) {
    const [lo, hi] = ranges[k];
    (c as unknown as Record<string, unknown>)[k] = number(
      r[k],
      Number(c[k as keyof Config]),
      lo,
      hi,
    );
  }
  c.target = clamp(c.target, ...(targetBounds(c) as [number, number]));
  c.demand = clamp(
    c.demand,
    c.request === "duty" ? -100 : c.request === "torque" ? -40 : -12,
    c.request === "duty" ? 100 : c.request === "torque" ? 40 : 12,
  );
  if (Array.isArray(r.graphs))
    c.graphs = [
      "response",
      "error",
      "output",
      "velocity",
      "acceleration",
      "terms",
    ].filter((k) => (r.graphs as unknown[]).includes(k));
  return c;
}
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
export function readConfig(search: string): Config {
  try {
    const q = new URLSearchParams(search),
      encoded = q.get("experiment");
    if (encoded && encoded.length <= 12000)
      return validate(JSON.parse(encoded));
    const preset = q.get("preset");
    let c = validate(
      preset && Object.hasOwn(presets, preset)
        ? { ...defaults, ...presets[preset].config }
        : defaults,
    );
    const method = q.get("method");
    if (method && Object.hasOwn(methods, method))
      c = validate({
        ...c,
        request:
          method === "open"
            ? "voltage"
            : method === "bang" || method === "ff"
              ? "velocity"
              : c.request,
        a: { ...c.a, method },
      });
    const request = q.get("request");
    if (request && Object.hasOwn(requests, request))
      c = validate({
        ...c,
        request,
        a: {
          ...c.a,
          method: ["duty", "voltage", "torque"].includes(request)
            ? "open"
            : request === "magic"
              ? "profile"
              : "pid",
        },
        mechanism: request === "velocity" ? "wheel" : c.mechanism,
      });
    return c;
  } catch {
    return validate(defaults);
  }
}
export function serialize(c: Config) {
  return "?experiment=" + encodeURIComponent(JSON.stringify(validate(c)));
}
