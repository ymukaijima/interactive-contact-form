"use client";

import { motion } from "framer-motion";
import Image from "next/image"; // Imageコンポーネントをインポート

const shapes = [
  {
    id: 1,
    src: "/shapes/blue-big.svg",
    size: 180,
    x: "5%",
    y: "10%",
    duration: 25,
  },
  {
    id: 2,
    src: "/shapes/pink-medium.svg",
    size: 120,
    x: "80%",
    y: "15%",
    duration: 18,
  },
  {
    id: 3,
    src: "/shapes/green-small.svg",
    size: 80,
    x: "70%",
    y: "60%",
    duration: 22,
  },
  {
    id: 4,
    src: "/shapes/orange-big.svg",
    size: 150,
    x: "10%",
    y: "70%",
    duration: 30,
  },
  {
    id: 5,
    src: "/shapes/purple-medium.svg",
    size: 100,
    x: "40%",
    y: "40%",
    duration: 20,
  },
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
          animate={{
            y: [0, -40, 0],
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* <img> の代わりに <Image /> を使う */}
          <Image
            src={shape.src}
            alt=""
            width={shape.size} // サイズを指定
            height={shape.size}
            className="w-full h-full opacity-40 object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
