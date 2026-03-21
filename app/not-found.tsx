import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">ไม่พบหน้าที่ค้นหา</h2>
          <p className="text-muted-foreground max-w-md">
            หน้าที่คุณต้องการเข้าถึงไม่มีอยู่ในระบบ หรืออาจถูกย้ายไปยังตำแหน่งอื่นแล้ว
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าก่อนหน้า
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              กลับหน้าหลัก
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}