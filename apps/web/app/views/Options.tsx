import { motion } from "framer-motion";

type Props = {
  goDiscover: () => void;
  goBook: () => void;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
};

export function Options({ goDiscover, goBook, onTouchStart, onTouchEnd }: Props) {
  return (
    <div
      className="flex h-full items-center justify-center px-6 sm:px-10"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        className="relative grid w-full max-w-5xl grid-cols-1 gap-10 px-6 text-center sm:grid-cols-2 sm:items-start sm:justify-items-center sm:gap-14 sm:px-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-x-12 top-1/2 h-px bg-[#2f1126]/10 sm:inset-y-10 sm:left-1/2 sm:w-px sm:h-auto" />

        <button
          onClick={goDiscover}
          className="group flex w-full max-w-md flex-col items-center justify-center gap-5 rounded-3xl px-8 py-6 text-center transition duration-400 hover:-translate-y-1 hover:bg-white/45 hover:shadow-[0_24px_60px_-28px_rgba(47,17,38,0.28)] sm:max-w-xl sm:px-12"
        >
          <h2 className="font-[var(--font-display)] text-4xl leading-[1.04] text-[#b35a8c] sm:text-5xl whitespace-nowrap">
            Ontdek wie we zijn.
          </h2>
          <p className="mx-auto max-w-md text-lg text-[#2f1a2a]/80 sm:max-w-sm">
            Klinische luxe, zachte champagne accenten, rust en precisie. Bekijk sfeer, aanpak en hygiëne.
          </p>
          <span className="h-px w-24 bg-gradient-to-r from-transparent via-[#2f1126]/30 to-transparent transition duration-300 ease-out group-hover:w-28 group-hover:via-[#a36ba0]/50" />
        </button>

        <button
          onClick={goBook}
          className="group flex w-full max-w-md flex-col items-center justify-center gap-5 rounded-3xl px-8 py-6 text-center transition duration-400 hover:-translate-y-1 hover:bg-white/45 hover:shadow-[0_24px_60px_-28px_rgba(47,17,38,0.28)] sm:max-w-xl sm:px-12"
        >
          <h2 className="font-[var(--font-display)] text-4xl leading-[1.04] text-[#b35a8c] sm:text-5xl whitespace-nowrap">
            Plan je afspraak.
          </h2>
          <p className="mx-auto max-w-md text-lg text-[#2f1a2a]/80 sm:max-w-sm">
            Ontdek onze diensten, kies je moment, alles soepel en persoonlijk.
          </p>
          <span className="h-px w-24 bg-gradient-to-r from-transparent via-[#2f1126]/30 to-transparent transition duration-300 ease-out group-hover:w-28 group-hover:via-[#a36ba0]/50" />
        </button>
      </motion.div>
    </div>
  );
}
