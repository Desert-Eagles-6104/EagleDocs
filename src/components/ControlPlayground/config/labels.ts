import { type Method, type Request } from "../model/constants";
export const methods: Record<Method, string> = {
  open: "חוג פתוח",
  pid: "משוב • P / PI / PD / PID",
  ff: "Feedforward",
  combined: "PID + Feedforward",
  bang: "Bang-Bang",
  profile: "פרופיל תנועה",
};
export const requests: Record<Request, string> = {
  duty: "Duty Cycle - אחוזי עוצמה",
  voltage: "Voltage - מתח",
  velocity: "Velocity - מהירות",
  position: "Position - מיקום",
  torque: "Torque Current - זרם מומנט",
  magic: "Motion Magic - תנועה לפי פרופיל",
};
// Goal names describe the experiment; Phoenix request names are implementation
// details kept separately for existing links and the optional teaching material.
export const goals: Record<Request, string> = {
  position: "להגיע למיקום ולהחזיק בו",
  velocity: "לשמור על מהירות",
  voltage: "להפעיל מתח קבוע",
  torque: "להפעיל זרם קבוע",
  duty: "להפעיל בעוצמה קבועה (%)",
  magic: "להגיע למיקום ולהחזיק בו",
};
