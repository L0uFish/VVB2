import { AnimatePresence, motion } from "framer-motion";
import type { Service } from "../types";

type Props = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
  services: Service[];
  onSelectService: (service: Service) => void;
  onBack: () => void;
};

export function Book({
  categories,
  selectedCategory,
  onSelectCategory,
  services,
  onSelectService,
  onBack,
}: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-10 text-center sm:px-10">
      <motion.h3
        className="font-[var(--font-display)] text-4xl leading-[1.04] text-[#2f1126] sm:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        Plan je afspraak
      </motion.h3>
      <motion.p
        className="max-w-2xl text-base text-[#3f2635]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      >
        Kies eerst een categorie, daarna je behandeling. Alles in een rustige, heldere flow.
      </motion.p>

      <div className="flex h-full w-full max-w-5xl flex-col space-y-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {categories.length === 0 && (
            <span className="text-sm text-[#3f2635]">Geen categorieën gevonden.</span>
          )}
          {categories.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`group relative px-4 py-2 text-lg font-semibold tracking-wide transition ${
                  active ? "text-[#b35a8c]" : "text-[#2f1126]"
                }`}
              >
                {cat}
                <span
                  className={`absolute left-1/2 top-full mt-1 h-px w-8 -translate-x-1/2 transition ${
                    active ? "bg-[#b35a8c]" : "bg-transparent group-hover:bg-[#2f1126]/40"
                  }`}
                />
                {!active && (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[#2f1126]/4 opacity-0 transition group-hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
              className="grid gap-3 md:grid-cols-2"
            >
              {services
                .filter((s) => selectedCategory === (s.category || "Overig"))
                .map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                    whileHover={{ y: -2 }}
                    className="flex h-full flex-col gap-2 rounded-2xl bg-white/85 p-4 text-[#2f1126] shadow-[0_14px_34px_-26px_rgba(47,17,38,0.28)] backdrop-blur-sm transition"
                    onClick={() => onSelectService(service)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-lg font-semibold">{service.name}</h4>
                      </div>
                      <div className="min-h-[32px] space-y-0.5 text-right text-xs font-semibold">
                        {service.promo_price !== null ? (
                          <>
                            {service.price !== null && (
                              <p className="text-[#3f2635]/60 line-through">
                                € {service.price?.toFixed(2)}
                              </p>
                            )}
                            <p className="text-[#b35a8c] text-sm">€ {service.promo_price?.toFixed(2)}</p>
                          </>
                        ) : (
                          <p>{service.price !== null ? `€ ${service.price?.toFixed(2)}` : ""}</p>
                        )}
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[#3f2635]">{service.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-[#2f1126]">
                      {service.duration_min ? (
                        <span className="rounded-full bg-[#f5d7e3] px-3 py-1 font-semibold">
                          {service.duration_min} min
                        </span>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              {services.filter((s) => selectedCategory === (s.category || "Overig")).length === 0 && (
                <div className="rounded-3xl bg-white/70 p-6 text-sm text-[#3f2635] shadow-[0_12px_30px_-24px_rgba(47,17,38,0.3)]">
                  Geen services in deze categorie.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        <div className="mt-auto flex justify-center pt-6">
          <button
            onClick={onBack}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
          >
            Terug
          </button>
        </div>
      </div>
    </div>
  );
}
