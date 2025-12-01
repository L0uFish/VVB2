import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onBack: () => void;
};

export function Discover({ onBack }: Props) {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <motion.div
      className="flex h-full w-full items-start justify-center overflow-y-auto px-4 py-8 sm:px-10 sm:py-10"
      onWheelCapture={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-6xl space-y-10 pb-6">
        <div className="grid gap-8 md:gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6 text-left text-[#2f1126]">
            <motion.p
              className="text-sm uppercase tracking-[0.3em] text-[#8a4c7d]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              VV Beauty
            </motion.p>
            <motion.h3
              className="font-[var(--font-display)] text-4xl leading-[1.05] text-[#2f1126] sm:text-5xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              Ontdek wie we zijn.
            </motion.h3>
            <motion.p
              className="max-w-2xl text-lg text-[#2f1a2a]/85"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            >
              Een rustige studio waar precisie en zachtheid samenkomen. Steriele tools, een vaste aanpak en
              voldoende ruimte tussen afspraken zodat jouw moment ongestoord blijft.
            </motion.p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Steriele instrumenten & disposable files",
                "Hygiëneprotocol zoals in een clinic",
                "Gedempt licht en stille omgeving",
                "Vaste tarieven, heldere communicatie",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-[#2f1126] shadow-[0_12px_32px_-24px_rgba(47,17,38,0.25)]"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[#2f1126]">
              {["Nagels", "Lashlifts", "Westerlo", "Met of zonder promo"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-3 py-1 shadow-[0_10px_26px_-22px_rgba(47,17,38,0.3)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-[0_24px_60px_-34px_rgba(47,17,38,0.45)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,222,236,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(214,187,227,0.35),transparent_35%)]" />
            <div className="relative space-y-4 text-[#2f1126]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#8a4c7d]">Aanpak</p>
              <h4 className="text-2xl font-semibold leading-tight">Exact, vriendelijk, discreet.</h4>
              <p className="text-sm text-[#2f1a2a]/85">
                Zorgvuldige voorbereiding, steriele werkwijze en een kalme sfeer. Elke afspraak krijgt dezelfde
                aandacht, zonder haast.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Hygiëne", value: "Clinic-grade" },
                  { label: "Materialen", value: "Steriel & disposable" },
                  { label: "Tijd", value: "Ruimte per afspraak" },
                  { label: "Service", value: "Persoonlijk & helder" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/70 px-3 py-2 text-sm shadow-[0_10px_28px_-22px_rgba(47,17,38,0.3)]"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a4c7d]">{item.label}</p>
                    <p className="text-sm font-semibold text-[#2f1126]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 rounded-3xl bg-white/70 p-6 text-[#2f1126] shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)] backdrop-blur-sm sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
          <div className="space-y-3 text-left">
            <h4 className="font-[var(--font-display)] text-2xl text-[#2f1126]">Contact</h4>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">VVBeauty</p>
              <a
                className="block text-[#2f1126] underline underline-offset-4 transition hover:text-[#8a4c7d]"
                href="tel:+32477442293"
              >
                +32 477 44 22 93
              </a>
              <a
                className="block text-[#2f1126] underline underline-offset-4 transition hover:text-[#8a4c7d]"
                href="mailto:info@vvbeauty.be"
              >
                info@vvbeauty.be
              </a>
              <a
                className="block text-[#2f1126] underline underline-offset-4 transition hover:text-[#8a4c7d]"
                href="https://maps.google.com/?q=Goorkenshof 36, 2260 Westerlo"
                target="_blank"
                rel="noreferrer"
              >
                Goorkenshof 36, 2260 Westerlo
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm sm:items-end sm:text-right">
            {[
              { label: "WhatsApp", href: "https://wa.me/32477442293" },
              { label: "Instagram", href: "https://www.instagram.com" },
              { label: "Facebook", href: "https://www.facebook.com" },
            ].map((item) => (
              <a
                key={item.label}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#d48ab8] to-[#b35a8c] px-4 py-2 text-white shadow-[0_14px_30px_-18px_rgba(47,17,38,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(47,17,38,0.4)]"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 text-left text-[#2f1126] shadow-[0_24px_60px_-28px_rgba(47,17,38,0.45)]">
              <button
                onClick={() => setShowLegal(false)}
                className="absolute right-4 top-4 rounded-full bg-[#2f1126] px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_24px_-18px_rgba(47,17,38,0.4)] transition hover:-translate-y-0.5"
              >
                Sluiten
              </button>
              <h4 className="font-[var(--font-display)] text-xl text-[#2f1126]">Juridische informatie & privacy</h4>
              <div className="mt-3 space-y-2 text-sm text-[#2f1a2a]/85">
                <p className="font-semibold">VVBeauty — Privacyverklaring</p>
                <p>
                  VVBeauty, eigendom van Vanswijgenhoven Veronique (BE1002643369), gevestigd te Goorkenshof 36,
                  2260 Westerlo, België.
                </p>
                <p className="font-semibold">Welke gegevens verwerken we?</p>
                <p>Naam, e-mailadres, telefoonnummer, geboekte dienst + datum & tijdstip.</p>
                <p className="font-semibold">Waarom?</p>
                <p>Contractueel voor afspraken, wettelijk voor boekhouding, gerechtvaardigd belang voor communicatie.</p>
                <p className="font-semibold">Met wie delen we?</p>
                <p>Supabase (database & auth), Vercel (hosting), Mailersend (mail).</p>
                <p className="font-semibold">Bewaartermijnen</p>
                <p>Afspraken/klanten: 24 maanden, boekhouding: 7 jaar, e-mails: 12 maanden.</p>
                <p className="font-semibold">Cookies</p>
                <p>Alleen functionele cookies (supabase auth/sessies). Geen tracking of ads.</p>
                <p className="font-semibold">Impressum & auteursrecht</p>
                <p>
                  VVBeauty — Vanswijgenhoven Veronique, BE1002643369, startdatum 02-01-2024. © 2025 VVBeauty /
                  Veronique Vanswijgenhoven. Gebruik zonder schriftelijke toestemming is verboden.
                </p>
                <p className="font-semibold">Contact voor rechten/vragen</p>
                <p>info@vvbeauty.be</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 md:justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-[#2f1126] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(47,17,38,0.45)] transition hover:-translate-y-0.5"
          >
            Terug
          </button>
          <button
            onClick={() => setShowLegal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2f1126] shadow-[0_12px_28px_-18px_rgba(47,17,38,0.3)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
          >
            Juridische info
          </button>
        </div>
      </div>
    </motion.div>
  );
}
