/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import type { RefObject } from "react";

type Props = {
  onWheel: React.WheelEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  heroRef: RefObject<HTMLDivElement>;
};

export function Hero({ onWheel, onTouchStart, onTouchEnd, heroRef }: Props) {
  return (
    <motion.div
      key="hero"
      className="relative flex h-full items-center justify-center overflow-hidden"
      onWheelCapture={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={heroRef}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#f5d7e3] blur-3xl opacity-70"
          animate={{ y: [0, -14, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-16 top-0 h-80 w-80 rounded-full bg-[#d7a3e3] blur-3xl opacity-60"
          animate={{ y: [0, 18, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="relative flex flex-col items-center gap-4 px-6 text-center sm:px-10">
        <motion.p
          className="text-sm uppercase tracking-[0.32em] text-[#8a4c7d]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Luxe salon
        </motion.p>
        <motion.h1
          className="font-[var(--font-display)] text-6xl leading-[1.04] text-[#2f1126] sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.25 }}
        >
          VV Beauty
        </motion.h1>
        <motion.div
          className="mt-6 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
        >
          <motion.img
            src="/LogoNoBg.png"
            alt="VV Beauty logo"
            className="h-[60vh] w-auto max-w-xs sm:h-[80vh] sm:max-w-none object-contain opacity-90 drop-shadow-[0_16px_45px_rgba(47,17,38,0.35)]"
            animate={{ scale: [0.96, 1.02, 0.96], rotate: [0, 0.4, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
