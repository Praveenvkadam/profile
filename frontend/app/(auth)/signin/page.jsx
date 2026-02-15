"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

export default function SigninPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const API = process.env.NEXT_PUBLIC_API_URL;

  async function onSubmit(values) {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Signin</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Input placeholder="Email" {...form.register("email")} />

            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="Password"
                {...form.register("password")}
              />

              <span
                onClick={() => setShow(!show)}
                className="absolute right-3 top-2 cursor-pointer"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </span>
            </div>

            <Button className="w-full">Signin</Button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link href="/signup">Signup</Link>
            <Link href="/forgot-password">Forgot Password</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
