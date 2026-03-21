import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบติดตามตัวชี้วัด - รพ.สต. อบจ.อุบลราชธานี",
  description:
    "ระบบติดตามตัวชี้วัด รพ.สต. สังกัด อบจ.อุบลราชธานี ครอบคลุมข้อมูลหน่วยบริการ ผู้ใช้ และข้อมูลสำคัญของระบบ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <Header />
          <main className="container py-6">{children}</main>
          <footer className="mt-12 border-t bg-card py-6">
            <div className="container text-center text-sm text-muted-foreground">
              <p>© 2567 องค์การบริหารส่วนจังหวัดอุบลราชธานี</p>
              <p className="mt-1">ระบบติดตามตัวชี้วัด รพ.สต. และข้อมูลสุขภาพระดับพื้นที่</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
