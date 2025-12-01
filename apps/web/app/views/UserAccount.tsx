/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

type Status = { kind: "info" | "error" | "success"; text: string };
type Upcoming = {
  id: string;
  starts_at: string;
  status: string;
  service?: { id: string; name: string; category?: string | null } | null;
};
type Past = Upcoming;

export function UserAccount() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [hydratedOnce, setHydratedOnce] = useState(false);
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const redirectHandled = useRef(false);
  const triggerRedirect = () => {
    const redirect = searchParams.get("redirect");
    if (redirect && !redirectHandled.current) {
      redirectHandled.current = true;
      router.push(decodeURIComponent(redirect));
    }
  };

  const normalizeBelgianPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    let normalized = raw.trim();
    if (digits.startsWith("0032")) {
      normalized = "+32" + digits.slice(4);
    } else if (digits.startsWith("32")) {
      normalized = "+32" + digits.slice(2);
    } else if (digits.startsWith("0")) {
      normalized = "+32" + digits.slice(1);
    } else if (raw.startsWith("+32")) {
      normalized = "+32" + digits.replace(/^32/, "");
    }
    if (!normalized.startsWith("+32")) normalized = "+32" + digits;
    const local = normalized.replace("+32", "");
    const valid = local.length === 8 || local.length === 9;
    return {
      valid,
      normalized,
      reason: valid ? null : "Telefoon moet een Belgisch nummer zijn (bv. 04..., +32..., 0032...).",
    };
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? null);
        const found = await hydrateClient(data.user.id, data.user.email ?? null, data.user.user_metadata);
        if (!found) {
          await upsertClient(
            data.user.id,
            data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? "",
            data.user.email ?? null,
            ""
          );
        }
        await fetchUpcoming(data.user.id);
        await fetchPast(data.user.id);
        triggerRedirect();
      }
      setHydratedOnce(true);
    });
  }, [supabase, searchParams, router]);

  const hydrateClient = async (authId: string, authEmail: string | null, metadata: any) => {
    const { data: client } = await supabase
      .from("clients")
      .select("phone, name, email")
      .eq("auth_user_id", authId)
      .maybeSingle();
    if (client) {
      setPhone(client.phone ?? "");
      setName(client.name ?? (metadata?.full_name ?? metadata?.name ?? ""));
      if (client.email) setUserEmail(client.email);
    } else {
      setPhone("");
      setName(metadata?.full_name ?? metadata?.name ?? "");
    }
    return !!client;
  };

  const fetchUpcoming = async (clientId: string) => {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from("bookings")
      .select("id, starts_at, status, service:service_id (id, name, category)")
      .eq("client_id", clientId)
      .eq("status", "confirmed")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true });
    setUpcoming((data as any) ?? []);
  };
  const [past, setPast] = useState<Past[]>([]);
  const fetchPast = async (clientId: string) => {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from("bookings")
      .select("id, starts_at, status, service:service_id (id, name, category)")
      .eq("client_id", clientId)
      .lt("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(5);
    setPast((data as any) ?? []);
  };

  const upsertClient = async (authId: string, nameVal: string, emailVal: string | null, phoneVal: string) => {
    await supabase.from("clients").upsert({
      id: authId,
      auth_user_id: authId,
      role: "client",
      name: nameVal || null,
      email: emailVal,
      phone: phoneVal || null,
    });
  };

  const handleEmailLogin = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? email);
        await hydrateClient(data.user.id, data.user.email ?? null, data.user.user_metadata);
        await fetchUpcoming(data.user.id);
        await fetchPast(data.user.id);
        triggerRedirect();
        setStatus({ kind: "success", text: "Ingelogd." });
      }
    } catch (err: any) {
      setStatus({ kind: "error", text: err.message ?? "Login mislukt." });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!name.trim() || !phone.trim()) throw new Error("Naam en telefoon zijn verplicht.");
      const phoneCheck = normalizeBelgianPhone(phone);
      if (!phoneCheck.valid) throw new Error(phoneCheck.reason ?? "Ongeldig telefoonnummer.");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      const authUser = data.user;
      if (authUser) {
        await upsertClient(authUser.id, name, authUser.email ?? email, phoneCheck.normalized);
        setUserId(authUser.id);
        setUserEmail(authUser.email ?? email);
        setStatus({ kind: "success", text: "Account aangemaakt. Controleer je mail voor bevestiging." });
        await fetchUpcoming(authUser.id);
        await fetchPast(authUser.id);
        triggerRedirect();
      } else {
        setStatus({ kind: "info", text: "Controleer je mail voor bevestiging." });
      }
    } catch (err: any) {
      setStatus({ kind: "error", text: err.message ?? "Kon account niet aanmaken." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setStatus(null);
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      // after redirect back, useEffect will hydrate and fetch upcoming
    } catch (err: any) {
      setStatus({ kind: "error", text: err.message ?? "Google login faalde." });
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setStatus(null);
    setLoading(true);
    try {
      const phoneCheck = normalizeBelgianPhone(phone);
      if (!phoneCheck.valid) throw new Error(phoneCheck.reason ?? "Ongeldig telefoonnummer.");

      if (userEmail) {
        const { error: authError } = await supabase.auth.updateUser({ email: userEmail });
        if (authError) throw authError;
      }

      await upsertClient(userId, name, userEmail, phoneCheck.normalized);
      setPhone(phoneCheck.normalized);
      setStatus({ kind: "success", text: "Gegevens opgeslagen." });
    } catch (err: any) {
      setStatus({ kind: "error", text: err.message ?? "Opslaan mislukt." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setName("");
    setPhone("");
    setStatus({ kind: "info", text: "Uitgelogd." });
    setUpcoming([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9fd] via-[#f7f1f6] to-[#f0e7f4] px-6 py-10 text-[#1c0f19] sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
              aria-label="Home"
            >
              <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 3s-6.186 5.34-9.643 8.232c-.203.184-.357.452-.357.768 0 .553.447 1 1 1h2v7c0 .553.447 1 1 1h3c.553 0 1-.448 1-1v-4h4v4c0 .552.447 1 1 1h3c.553 0 1-.447 1-1v-7h2c.553 0 1-.447 1-1 0-.316-.154-.584-.383-.768-3.433-2.892-9.617-8.232-9.617-8.232z" />
              </svg>
            </Link>
            <h1 className="font-[var(--font-display)] text-3xl text-[#2f1126]">Je account</h1>
          </div>
          {userId && (
            <button
              onClick={handleLogout}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
            >
              Log uit
            </button>
          )}
        </div>

        {status && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.kind === "error"
                ? "bg-red-50 text-red-700"
                : status.kind === "success"
                ? "bg-green-50 text-green-700"
                : "bg-white text-[#2f1126]"
            }`}
          >
            {status.text}
          </div>
        )}

        {!userId && (
          <div className="grid gap-8 rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)]">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#2f1126]">
              <button
                className={`rounded-full px-4 py-2 transition ${authView === "login" ? "bg-[#2f1126] text-white" : "bg-[#f0e7f4] text-[#2f1126]"}`}
                onClick={() => setAuthView("login")}
              >
                Log in
              </button>
              <button
                className={`rounded-full px-4 py-2 transition ${authView === "signup" ? "bg-[#2f1126] text-white" : "bg-[#f0e7f4] text-[#2f1126]"}`}
                onClick={() => setAuthView("signup")}
              >
                Maak account
              </button>
            </div>

            {authView === "login" ? (
              <div className="grid gap-4">
                <p className="text-sm font-semibold text-[#2f1126]">Log in met email en wachtwoord</p>
                <input
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] transition ${
                    loading ? "bg-[#e8e0eb] text-[#2f1126]/50 cursor-not-allowed" : "bg-[#2f1126] text-white hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? "Bezig..." : "Log in"}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                <p className="text-sm font-semibold text-[#2f1126]">Maak een account (email + wachtwoord)</p>
                <input
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Telefoon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handleEmailSignup}
                  disabled={loading}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] transition ${
                    loading ? "bg-[#e8e0eb] text-[#2f1126]/50 cursor-not-allowed" : "bg-[#2f1126] text-white hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? "Bezig..." : "Account aanmaken"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a4c7d]">of</p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
              >
                <span aria-hidden className="h-5 w-5">
                  <svg viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#EA4335" d="M24 9.5c3.04 0 5.8 1.05 7.96 3.12l5.94-5.94C33.88 3.07 29.38 1 24 1 14.98 1 7.06 6.16 3.58 13.4l6.95 5.4C12.23 13.13 17.63 9.5 24 9.5Z" />
                    <path fill="#4285F4" d="M46.5 24.5c0-1.48-.13-2.93-.38-4.34H24v8.21h12.62c-.54 2.91-2.12 5.38-4.53 7.05l7.08 5.5C43.77 36.59 46.5 30.98 46.5 24.5Z" />
                    <path fill="#FBBC05" d="M10.53 28.79c-.48-1.43-.75-2.95-.75-4.54 0-1.59.27-3.11.75-4.54l-6.95-5.4C1.86 16.76 1 20.26 1 24c0 3.74.86 7.24 2.58 10.69l6.95-5.9Z" />
                    <path fill="#34A853" d="M24 47c5.38 0 9.9-1.77 13.2-4.78l-7.08-5.5c-1.97 1.32-4.5 2.08-6.12 2.08-5.82 0-10.76-3.93-12.48-9.41l-6.95 5.9C7.06 41.84 14.98 47 24 47Z" />
                    <path fill="none" d="M1 1h46v46H1Z" />
                  </svg>
                </span>
                <span>Log in met Google</span>
              </button>
            </div>
          </div>
        )}

        {userId && (
          <div className="grid gap-4 rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)]">
            <p className="text-sm font-semibold text-[#2f1126]">Profielgegevens</p>
            <input
              className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
              placeholder="Naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
              placeholder="Telefoon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126]"
              placeholder="Email"
              value={userEmail ?? ""}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] transition ${
                loading ? "bg-[#e8e0eb] text-[#2f1126]/50 cursor-not-allowed" : "bg-[#2f1126] text-white hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        )}

        {userId && (
          <div className="grid gap-3 rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2f1126]">Toekomstige afspraken</p>
            </div>
            {upcoming.length === 0 && <p className="text-sm text-[#3f2635]">Geen toekomstige afspraken.</p>}
            {upcoming.map((appt) => {
              const date = new Date(appt.starts_at);
              const formatter = new Intl.DateTimeFormat("nl-BE", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={appt.id} className="rounded-2xl border border-[#f0e7f4] bg-[#fff9fd] px-4 py-3">
                  <p className="text-sm font-semibold text-[#2f1126]">
                    {appt.service?.name ?? "Behandeling"}
                    {appt.service?.category ? ` · ${appt.service.category}` : ""}
                  </p>
                  <p className="text-sm text-[#3f2635]">{formatter.format(date)}</p>
                </div>
              );
            })}
          </div>
        )}

        {userId && (
          <div className="grid gap-3 rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2f1126]">Voorbije afspraken</p>
            </div>
            {past.length === 0 && <p className="text-sm text-[#3f2635]">Geen vorige afspraken.</p>}
            {past.map((appt) => {
              const date = new Date(appt.starts_at);
              const formatter = new Intl.DateTimeFormat("nl-BE", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={appt.id} className="rounded-2xl border border-[#f0e7f4] bg-[#fff9fd] px-4 py-3">
                  <p className="text-sm font-semibold text-[#2f1126]">
                    {appt.service?.name ?? "Behandeling"}
                    {appt.service?.category ? ` · ${appt.service.category}` : ""}
                  </p>
                  <p className="text-sm text-[#3f2635]">{formatter.format(date)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

