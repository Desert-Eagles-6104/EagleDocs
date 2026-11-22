import { type Method, type Request } from "../model/constants";
export const methods: Record<Method, string> = {
  open: "חוג פתוח",
  pid: "משוב • P / PI / PD / PID",
  ff: "Feedforward",
  combined: "PID + Feedforward",
  bang: "Bang-Bang",
  profile: "פרופיל תנועה",
};
export const goals: Record<Request, string> = {
  position: "להגיע למיקום ולהחזיק בו",
  velocity: "לשמור על מהירות",
  voltage: "להפעיל מתח קבוע",
  torque: "להפעיל זרם קבוע",
  duty: "להפעיל בעוצמה קבועה (%)",
  magic: "להגיע למיקום ולהחזיק בו",
};
