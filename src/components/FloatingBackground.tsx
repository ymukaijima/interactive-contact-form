"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const shapes = [
  { id: 1, src: "/shapes/blue-big.svg", size: 190, x: "2%", y: "4%" },
  { id: 2, src: "/shapes/green-medium.svg", size: 110, x: "78%", y: "3%" },
  { id: 3, src: "/shapes/light-blue-small.svg", size: 70, x: "52%", y: "-1%" },
  { id: 4, src: "/shapes/pink-big.svg", size: 160, x: "87%", y: "42%" },
  { id: 5, src: "/shapes/yellow-medium.svg", size: 100, x: "74%", y: "78%" },
  { id: 6, src: "/shapes/light-pink-small.svg", size: 75, x: "46%", y: "87%" },
  { id: 7, src: "/shapes/orange-big.svg", size: 150, x: "1%", y: "68%" },
  { id: 8, src: "/shapes/purple-medium.svg", size: 120, x: "7%", y: "36%" },
  { id: 9, src: "/shapes/red-small.svg", size: 65, x: "28%", y: "12%" },
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
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
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
