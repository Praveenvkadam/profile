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

const schema = z
  .object({
    email: z.string().min(1).email(),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const API=process.env.NEXT_PUBLIC_API_URL
  async function onSubmit(values) {
    await fetch(`${API}/api/auth/reset-by-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    router.push("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Input placeholder="Email" {...form.register("email")} />

            <div className="relative">
              <Input
                type={show1 ? "text" : "password"}
                placeholder="New Password"
                {...form.register("newPassword")}
              />
              <span
                onClick={() => setShow1(!show1)}
                className="absolute right-3 top-2 cursor-pointer"
              >
                {show1 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </span>
            </div>

            <div className="relative">
              <Input
                type={show2 ? "text" : "password"}
                placeholder="Confirm Password"
                {...form.register("confirmPassword")}
              />
              <span
                onClick={() => setShow2(!show2)}
                className="absolute right-3 top-2 cursor-pointer"
              >
                {show2 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </span>
            </div>

            <Button className="w-full">Reset Password</Button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/signin">Back to Signin</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
