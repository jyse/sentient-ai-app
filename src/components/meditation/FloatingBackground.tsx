"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FloatingBackground({
  className
}: {
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      {/* Purple Glow Blob */}
      <motion.div
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: 0.2, scale: 1.5 }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 10,
          ease: "easeInOut"
        }}
        className="absolute left-[-30%] top-[-10%] h-[600px] w-[600px] rounded-full bg-awareness blur-3xl opacity-40"
      />

      {/* Blue Glow Blob */}
      <motion.div
        initial={{ opacity: 0.3, scale: 1 }}
        animate={{ opacity: 0.1, scale: 1.6 }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 12,
          ease: "easeInOut"
        }}
        className="absolute right-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-focus blur-2xl opacity-30"
      />
    </div>
  );
}
