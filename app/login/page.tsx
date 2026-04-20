<<<<<<< HEAD
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = searchParams?.get("callbackUrl") || "/settings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <ShieldCheck className="h-4 w-4" />
          ระบบจัดการข้อมูลสุขภาพ อบจ.อุบลราชธานี
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            เข้าสู่ระบบเพื่อจัดการผู้ใช้และข้อมูลระบบ
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            ใช้สำหรับเข้าสู่หน้าตั้งค่า จัดการบัญชีผู้ใช้ ตรวจสอบรอบปีงบประมาณ
            และดูภาพรวมข้อมูลหน่วยบริการในระบบ
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">จัดการผู้ใช้</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เพิ่ม แก้ไข เปิดปิดการใช้งาน และลบบัญชีผู้ใช้ได้จากหน้า Settings
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">ตรวจสอบข้อมูลหลัก</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ดูจำนวนหน่วยบริการ ปีงบประมาณ และข้อมูลสถานะระบบได้ในจุดเดียว
            </p>
          </div>
        </div>
      </section>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรอกบัญชีผู้ใช้เพื่อเข้าเมนูตั้งค่าและจัดการข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">อีเมล</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@ubonlocal.go.th"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">รหัสผ่าน</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              เมื่อเข้าสู่ระบบแล้วไปที่{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                หน้า Settings
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
=======
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/settings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <ShieldCheck className="h-4 w-4" />
          ระบบจัดการข้อมูลสุขภาพ อบจ.อุบลราชธานี
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            เข้าสู่ระบบเพื่อจัดการผู้ใช้และข้อมูลระบบ
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            ใช้สำหรับเข้าสู่หน้าตั้งค่า จัดการบัญชีผู้ใช้ ตรวจสอบรอบปีงบประมาณ
            และดูภาพรวมข้อมูลหน่วยบริการในระบบ
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">จัดการผู้ใช้</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เพิ่ม แก้ไข เปิดปิดการใช้งาน และลบบัญชีผู้ใช้ได้จากหน้า Settings
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">ตรวจสอบข้อมูลหลัก</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ดูจำนวนหน่วยบริการ ปีงบประมาณ และข้อมูลสถานะระบบได้ในจุดเดียว
            </p>
          </div>
        </div>
      </section>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรอกบัญชีผู้ใช้เพื่อเข้าเมนูตั้งค่าและจัดการข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">อีเมล</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@ubonlocal.go.th"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">รหัสผ่าน</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              เมื่อเข้าสู่ระบบแล้วไปที่{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                หน้า Settings
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
>>>>>>> 2fcc77a (refactor: remove src/ duplicate, add finance accountCode)
