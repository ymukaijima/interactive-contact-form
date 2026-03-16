"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type Shape = {
  id: number;
  src: string;
  size: number;
  x: string;
  y: string;
  restRotate: number; // angle after entry animation
};

const desktopShapes: Shape[] = [
  { id: 1, src: "/shapes/blue-big.svg",         size: 220, x: "1%",  y: "2%",  restRotate:  12 },
  { id: 2, src: "/shapes/green-medium.svg",      size: 130, x: "76%", y: "2%",  restRotate:  -8 },
  { id: 3, src: "/shapes/light-blue-small.svg",  size:  65, x: "52%", y: "-2%", restRotate:  15 },
  { id: 4, src: "/shapes/pink-big.svg",          size: 200, x: "85%", y: "40%", restRotate: -12 },
  { id: 5, src: "/shapes/yellow-small.svg",      size:  70, x: "65%", y: "78%", restRotate:  20 },
  { id: 6, src: "/shapes/light-pink-medium.svg", size: 140, x: "42%", y: "84%", restRotate:  -6 },
  { id: 7, src: "/shapes/orange-big.svg",        size: 190, x: "1%",  y: "65%", restRotate:  10 },
  { id: 8, src: "/shapes/purple-medium.svg",     size: 120, x: "5%",  y: "33%", restRotate: -15 },
  { id: 9, src: "/shapes/red-small.svg",         size:  60, x: "25%", y: "10%", restRotate:  18 },
];

// Mobile: all 9 colors, small variants, positioned along edges to avoid overlap
const mobileShapes: Shape[] = [
  { id: 1, src: "/shapes/blue-small.svg",       size: 90, x: "1%",  y: "2%",  restRotate:  10 },
  { id: 2, src: "/shapes/green-small.svg",      size: 60, x: "78%", y: "1%",  restRotate:  -7 },
  { id: 3, src: "/shapes/red-small.svg",        size: 50, x: "30%", y: "10%", restRotate:  14 },
  { id: 4, src: "/shapes/light-blue-small.svg", size: 55, x: "82%", y: "20%", restRotate: -10 },
  { id: 5, src: "/shapes/purple-small.svg",     size: 65, x: "1%",  y: "43%", restRotate:  18 },
  { id: 6, src: "/shapes/pink-small.svg",       size: 70, x: "78%", y: "38%", restRotate:  -5 },
  { id: 7, src: "/shapes/orange-small.svg",     size: 90, x: "1%",  y: "78%", restRotate:   8 },
  { id: 8, src: "/shapes/yellow-small.svg",     size: 55, x: "72%", y: "75%", restRotate: -13 },
  { id: 9, src: "/shapes/light-pink-small.svg", size: 60, x: "38%", y: "87%", restRotate:  16 },
];

function ShapeLayer({ shapes }: { shapes: Shape[] }) {
  const [wiggling, setWiggling] = useState<Record<number, boolean>>({});

  return (
    <>
      {shapes.map((shape) => {
        const isWiggling = wiggling[shape.id] ?? false;
        const dy = -(10 + (shape.id % 3) * 5);
        const dr = shape.id % 2 === 0 ? -8 : 8;

        return (
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
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: shape.restRotate }}
            transition={{ duration: 2, ease: "easeOut", delay: shape.id * 0.2 }}
            onAnimationComplete={() =>
              setWiggling((prev) => ({ ...prev, [shape.id]: true }))
            }
          >
            <motion.div
              animate={isWiggling ? { y: [0, dy, 0], rotate: [0, dr, 0] } : {}}
              transition={{
                duration: 8,
                times: [0, 0.5, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0,
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
          </motion.div>
        );
      })}
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
