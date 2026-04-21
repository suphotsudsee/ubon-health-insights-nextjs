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
      setError("เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเนเธกเนเธชเธณเน€เธฃเนเธ เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธญเธตเน€เธกเธฅเนเธฅเธฐเธฃเธซเธฑเธชเธเนเธฒเธ");
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
          เธฃเธฐเธเธเธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅเธชเธธเธเธ เธฒเธ เธญเธเธ.เธญเธธเธเธฅเธฃเธฒเธเธเธฒเธเธต
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเน€เธเธทเนเธญเธเธฑเธ”เธเธฒเธฃเธเธนเนเนเธเนเนเธฅเธฐเธเนเธญเธกเธนเธฅเธฃเธฐเธเธ
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            เนเธเนเธชเธณเธซเธฃเธฑเธเน€เธเนเธฒเธชเธนเนเธซเธเนเธฒเธ•เธฑเนเธเธเนเธฒ เธเธฑเธ”เธเธฒเธฃเธเธฑเธเธเธตเธเธนเนเนเธเน เธ•เธฃเธงเธเธชเธญเธเธฃเธญเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“
            เนเธฅเธฐเธ”เธนเธ เธฒเธเธฃเธงเธกเธเนเธญเธกเธนเธฅเธซเธเนเธงเธขเธเธฃเธดเธเธฒเธฃเนเธเธฃเธฐเธเธ
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">เธเธฑเธ”เธเธฒเธฃเธเธนเนเนเธเน</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เน€เธเธดเนเธก เนเธเนเนเธ เน€เธเธดเธ”เธเธดเธ”เธเธฒเธฃเนเธเนเธเธฒเธ เนเธฅเธฐเธฅเธเธเธฑเธเธเธตเธเธนเนเนเธเนเนเธ”เนเธเธฒเธเธซเธเนเธฒ Settings
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">เธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅเธซเธฅเธฑเธ</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เธ”เธนเธเธณเธเธงเธเธซเธเนเธงเธขเธเธฃเธดเธเธฒเธฃ เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“ เนเธฅเธฐเธเนเธญเธกเธนเธฅเธชเธ–เธฒเธเธฐเธฃเธฐเธเธเนเธ”เนเนเธเธเธธเธ”เน€เธ”เธตเธขเธง
            </p>
          </div>
        </div>
      </section>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ</CardTitle>
          <CardDescription>
            เธเธฃเธญเธเธเธฑเธเธเธตเธเธนเนเนเธเนเน€เธเธทเนเธญเน€เธเนเธฒเน€เธกเธเธนเธ•เธฑเนเธเธเนเธฒเนเธฅเธฐเธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">เธญเธตเน€เธกเธฅ</label>
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
              <label className="text-sm font-medium text-foreground">เธฃเธซเธฑเธชเธเนเธฒเธ</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="เธญเธขเนเธฒเธเธเนเธญเธข 8 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ"
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
              {isSubmitting ? "เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธ..." : "เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              เน€เธกเธทเนเธญเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเนเธฅเนเธงเนเธเธ—เธตเน{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                เธซเธเนเธฒ Settings
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
