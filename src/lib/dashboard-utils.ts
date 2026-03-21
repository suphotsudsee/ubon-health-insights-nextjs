export const monthList = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function getStatusInfo(percentage: number): {
  label: string;
  color: string;
  emoji: string;
  bgClass: string;
} {
  if (percentage <= 20) {
    return { label: "วิกฤต", color: "status-critical", emoji: "แดง", bgClass: "bg-status-critical" };
  }
  if (percentage <= 40) {
    return { label: "ต่ำกว่าเกณฑ์", color: "status-low", emoji: "ส้ม", bgClass: "bg-status-low" };
  }
  if (percentage <= 60) {
    return { label: "ปานกลาง", color: "status-medium", emoji: "เหลือง", bgClass: "bg-status-medium" };
  }
  if (percentage <= 80) {
    return { label: "ดี", color: "status-good", emoji: "เขียว", bgClass: "bg-status-good" };
  }
  return { label: "ดีมาก", color: "status-excellent", emoji: "ฟ้า", bgClass: "bg-status-excellent" };
}
