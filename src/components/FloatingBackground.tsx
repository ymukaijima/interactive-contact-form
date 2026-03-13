"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const shapes = [
  { id: 1, src: "/shapes/blue-big.svg", size: 180, x: "5%", y: "10%" },
  { id: 2, src: "/shapes/pink-medium.svg", size: 120, x: "80%", y: "15%" },
  { id: 3, src: "/shapes/green-small.svg", size: 80, x: "70%", y: "60%" },
  { id: 4, src: "/shapes/orange-big.svg", size: 150, x: "10%", y: "70%" },
  { id: 5, src: "/shapes/purple-medium.svg", size: 100, x: "40%", y: "40%" },
];

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 0.4, scale: 1, rotate: 0 }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: shape.id * 0.2,
          }}
        >
          <Image
            src={shape.src}
            alt=""
            width={shape.size}
            height={shape.size}
            className="w-full h-full object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
