"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/tasks");
  };

  const signUp = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/tasks");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-80 space-y-4 rounded-md bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-center">Task Manager Login</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
            {error}
          </p>
        )}

        <input
          className="border p-2 w-full rounded text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded text-sm"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={signIn}
          disabled={loading}
          className="bg-blue-500 text-white w-full p-2 rounded text-sm hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          onClick={signUp}
          disabled={loading}
          className="border w-full p-2 rounded text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
