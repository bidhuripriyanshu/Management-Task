"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
//supabase is a library for the database (Given the current auth token/session in this browser which user (if any) is logged in?)
      if (user) {
        router.replace("/tasks");
      } else {
        router.replace("/login");
      }
      setChecking(false);
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-gray-600">
        {checking ? "Checking your session..." : "Redirecting..."}
      </p>
    </div>
  );
}
