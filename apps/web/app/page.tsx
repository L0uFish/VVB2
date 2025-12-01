/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import type { Service } from "./types";
import { Hero } from "./views/Hero";
import { Options } from "./views/Options";
import { Discover } from "./views/Discover";
import { Book } from "./views/Book";
import { Schedule } from "./views/Schedule";

type View = "hero" | "options" | "discover" | "book" | "schedule";

const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.4, ease: "easeInOut" } },
};

export default function Page() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>("hero");
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingMessage, setBookingMessage] = useState<string>("");
  const [bookingError, setBookingError] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [restoredOnce, setRestoredOnce] = useState(false);

  const goOptions = () => setView("options");
  const goHero = () => setView("hero");
  const goDiscover = () => setView("discover");
  const goBook = () => setView("book");
  const goSchedule = () => setView("schedule");

  const handleHeroWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 0) {
      event.preventDefault();
      goOptions();
    }
  };

  const handleOptionsWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.deltaY < 0) goHero();
  };

  const handleViewWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.deltaY < 0) setView("options");
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleHeroTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartY.current;
    const endY = event.changedTouches[0]?.clientY ?? null;
    if (start !== null && endY !== null && start - endY > 40) {
      goOptions();
    }
    touchStartY.current = null;
  };

  const handleOptionsTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartY.current;
    const endY = event.changedTouches[0]?.clientY ?? null;
    if (start !== null && endY !== null && endY - start > 40) {
      goHero();
    }
    touchStartY.current = null;
  };

  useEffect(() => {
    supabase
      .from("services")
      .select(
        "id, name, category, description, duration_min, buffer_min, price, promo_price, active"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true, nullsFirst: true })
      .then(({ data }) => {
        if (data) {
          setServices(data as Service[]);
        }
      })
      .catch(() => {});
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const metaName = (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name;
        setUserName(metaName || u.email || null);
      } else {
        setUserName(null);
      }
    });
  }, [supabase]);

  const categories = Array.from(
    new Set(
      services
        .map((s) => s.category || "Overig")
        .filter((c): c is string => Boolean(c))
    )
  );

  const computeSlots = (dateStr: string, serviceId?: string, preselectSlot?: string) => {
    if (!dateStr || !serviceId) {
      setSlots([]);
      return;
    }
    const run = async () => {
      try {
        setLoadingSlots(true);
        const res = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`);
        const data = await res.json();
        setSlots(data.slots ?? []);
        if (preselectSlot && (data.slots ?? []).includes(preselectSlot)) {
          setSelectedSlot(preselectSlot);
        }
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    run();
  };

  const saveDraftAndRedirect = () => {
    if (selectedService && selectedDate && selectedSlot) {
      const params = new URLSearchParams({
        view: "schedule",
        serviceId: selectedService.id,
        date: selectedDate,
        slot: selectedSlot,
      });
      const query = `/?${params.toString()}`;
      try {
        localStorage.setItem(
          "bookingDraft",
          JSON.stringify({
            view: "schedule",
            serviceId: selectedService.id,
            date: selectedDate,
            slot: selectedSlot,
          })
        );
      } catch {
        /* ignore */
      }
      router.push(`/user?redirect=${encodeURIComponent(query)}`);
    } else {
      router.push("/user");
    }
  };

  useEffect(() => {
    if (restoredOnce) return;
    if (services.length === 0) return;
    const viewParam = searchParams.get("view");
    const serviceIdParam = searchParams.get("serviceId");
    const dateParam = searchParams.get("date");
    const slotParam = searchParams.get("slot");

    const applyRestore = (svcId?: string | null, date?: string | null, slot?: string | null, viewOverride?: View) => {
      if (!svcId) return false;
      const svc = services.find((s) => s.id === svcId);
      if (!svc) return false;
      setSelectedService(svc);
      setSelectedCategory(svc.category ?? null);
      if (date) {
        setSelectedDate(date);
        computeSlots(date, svc.id, slot || undefined);
      }
      if (slot) setSelectedSlot(slot);
      if (viewOverride) setView(viewOverride);
      else if (date) setView("schedule");
      return true;
    };

    let applied = false;
    if (serviceIdParam) {
      applied = applyRestore(
        serviceIdParam,
        dateParam,
        slotParam,
        (viewParam as View) || (dateParam ? "schedule" : undefined)
      );
    }

    if (!applied) {
      try {
        const cached = localStorage.getItem("bookingDraft");
        if (cached) {
          const parsed = JSON.parse(cached);
          applied = applyRestore(parsed.serviceId, parsed.date, parsed.slot, parsed.view as View);
        }
      } catch {
        /* ignore */
      }
    }

    if (viewParam && !serviceIdParam) {
      setView(viewParam as View);
    }
    if (applied) {
      try {
        localStorage.removeItem("bookingDraft");
      } catch {
        /* ignore */
      }
    }
    setRestoredOnce(true);
  }, [services, searchParams, restoredOnce]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-[#fff9fd] via-[#f7f1f6] to-[#f0e7f4] text-[#1c0f19]">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-end px-6 py-4 sm:px-10">
        <Link
          href="/user"
          className="pointer-events-auto rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
        >
          {userName ? userName : "Log in"}
        </Link>
      </div>
      <AnimatePresence mode="wait">
        {view === "hero" && (
          <motion.div
            key="hero"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Hero
              onWheel={handleHeroWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleHeroTouchEnd}
              heroRef={heroRef}
            />
          </motion.div>
        )}

        {view === "options" && (
          <motion.div
            key="options"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onWheelCapture={handleOptionsWheel}
            className="h-full"
          >
            <Options
              goDiscover={goDiscover}
              goBook={goBook}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleOptionsTouchEnd}
            />
          </motion.div>
        )}

        {view === "discover" && (
          <motion.div
            key="discover"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onWheelCapture={handleViewWheel}
            className="h-full"
          >
            <Discover onBack={goOptions} />
          </motion.div>
        )}

        {view === "book" && (
          <motion.div
            key="book"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onWheelCapture={handleViewWheel}
            className="h-full"
          >
            <Book
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              services={services}
              onSelectService={(service) => {
                setSelectedService(service);
                setSelectedDate("");
                setSlots([]);
                setSelectedSlot("");
                goSchedule();
              }}
              onBack={goOptions}
            />
          </motion.div>
        )}

        {view === "schedule" && (
          <motion.div
            key="schedule"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onWheelCapture={handleViewWheel}
            className="h-full"
          >
            <Schedule
              selectedService={selectedService}
              selectedDate={selectedDate}
              slots={slots}
              loading={loadingSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              onDateChange={(date) => {
                setSelectedDate(date);
                computeSlots(date, selectedService?.id);
              }}
              bookingMessage={bookingMessage}
              bookingError={bookingError}
              bookingLoading={bookingLoading}
              onBook={async () => {
                setBookingError("");
                setBookingMessage("");
                if (!selectedService || !selectedSlot) {
                  setBookingError("Kies een tijd en service.");
                  return;
                }
                setBookingLoading(true);
                try {
                  const { data: userData, error: userErr } = await supabase.auth.getUser();
                  if (userErr || !userData?.user) {
                    setBookingError("Log in om te boeken. We bewaren je keuze.");
                    saveDraftAndRedirect();
                    return;
                  }
                  const authId = userData.user.id;
                  const { data: client, error: clientErr } = await supabase
                    .from("clients")
                    .select("id, phone")
                    .eq("auth_user_id", authId)
                    .maybeSingle();
                  if (clientErr || !client) {
                    setBookingError("Werk eerst je profiel af.");
                    saveDraftAndRedirect();
                    return;
                  }
                  if (!client.phone) {
                    setBookingError("Vul je telefoonnummer aan om te boeken.");
                    saveDraftAndRedirect();
                    return;
                  }

                  const start = new Date(selectedSlot);
                  const duration = selectedService.duration_min + (selectedService.buffer_min || 0);
                  const end = new Date(start.getTime() + duration * 60000).toISOString();

                  const { error: insertErr } = await supabase.from("bookings").insert({
                    service_id: selectedService.id,
                    client_id: client.id,
                    starts_at: selectedSlot,
                    ends_at: end,
                    status: "confirmed",
                    notes: null,
                    source: "web",
                  });
                  if (insertErr) throw insertErr;
                  try {
                    localStorage.removeItem("bookingDraft");
                  } catch {
                    /* ignore */
                  }
                  setBookingMessage("Afspraak bevestigd! Bekijk je account.");
                  setTimeout(() => router.push("/user"), 600);
                } catch (err: any) {
                  setBookingError(err?.message ?? "Boeken mislukt.");
                } finally {
                  setBookingLoading(false);
                }
              }}
              onBack={goBook}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
