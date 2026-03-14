"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Shape = {
  id: number;
  src: string;
  size: number;
  x: string;
  y: string;
};

const desktopShapes: Shape[] = [
  { id: 1, src: "/shapes/blue-big.svg",         size: 220, x: "1%",  y: "2%"  },
  { id: 2, src: "/shapes/green-medium.svg",      size: 130, x: "76%", y: "2%"  },
  { id: 3, src: "/shapes/light-blue-small.svg",  size:  65, x: "52%", y: "-2%" },
  { id: 4, src: "/shapes/pink-big.svg",          size: 200, x: "85%", y: "40%" },
  { id: 5, src: "/shapes/yellow-small.svg",      size:  70, x: "65%", y: "78%" },
  { id: 6, src: "/shapes/light-pink-medium.svg", size: 140, x: "42%", y: "84%" },
  { id: 7, src: "/shapes/orange-big.svg",        size: 190, x: "1%",  y: "65%" },
  { id: 8, src: "/shapes/purple-medium.svg",     size: 120, x: "5%",  y: "33%" },
  { id: 9, src: "/shapes/red-small.svg",         size:  60, x: "25%", y: "10%" },
];

// Mobile: all 9 colors, small variants, positioned along edges to avoid overlap
const mobileShapes: Shape[] = [
  { id: 1, src: "/shapes/blue-small.svg",       size: 90, x: "1%",  y: "2%"  },
  { id: 2, src: "/shapes/green-small.svg",      size: 60, x: "78%", y: "1%"  },
  { id: 3, src: "/shapes/red-small.svg",        size: 50, x: "30%", y: "10%" },
  { id: 4, src: "/shapes/light-blue-small.svg", size: 55, x: "82%", y: "20%" },
  { id: 5, src: "/shapes/purple-small.svg",     size: 65, x: "1%",  y: "43%" },
  { id: 6, src: "/shapes/pink-small.svg",       size: 70, x: "78%", y: "38%" },
  { id: 7, src: "/shapes/orange-small.svg",     size: 90, x: "1%",  y: "78%" },
  { id: 8, src: "/shapes/yellow-small.svg",     size: 55, x: "72%", y: "75%" },
  { id: 9, src: "/shapes/light-pink-small.svg", size: 60, x: "38%", y: "87%" },
];

function ShapeLayer({ shapes }: { shapes: Shape[] }) {
  return (
    <>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -20, y: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, 0, -(10 + (shape.id % 3) * 5), 0] }}
          transition={{
            opacity: { duration: 2, ease: "easeOut", delay: shape.id * 0.2 },
            scale:   { duration: 2, ease: "easeOut", delay: shape.id * 0.2 },
            rotate:  { duration: 2, ease: "easeOut", delay: shape.id * 0.2 },
            y: {
              // 65-75s cycle: ~83% idle, ~9% rise, ~8% fall
              duration: 65 + (shape.id % 3) * 5,
              times: [0, 0.83, 0.91, 1],
              ease: "easeInOut",
              delay: shape.id * 0.2 + 5,
              repeat: Infinity,
              repeatType: "loop",
            },
          }}
        >
          <Image
            src={shape.src}
            alt=""
            width={shape.size}
            height={shape.size}
            className="block w-full h-full object-contain border-0 outline-none"
          />
        </motion.div>
      ))}
    </>
  );
}

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background image */}
      <Image
        src="/shapes/background.svg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      {/* Floating shapes on top */}
      <div className="hidden sm:block">
        <ShapeLayer shapes={desktopShapes} />
      </div>
      <div className="block sm:hidden">
        <ShapeLayer shapes={mobileShapes} />
      </div>
    </div>
  );
}
