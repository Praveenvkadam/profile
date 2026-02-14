"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
     
      <div className="flex justify-center items-center h-screen">
      <h1>plz login </h1>
      <Link href="/signin">Login</Link>
      <Button asChild>
        <Link href="/profile_form">form</Link>
      </Button>
      </div>
    </div>
  );
}