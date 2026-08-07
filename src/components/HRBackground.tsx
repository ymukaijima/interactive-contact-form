"use client";

import Image from "next/image";

type Shape = {
  id: number;
  src: string;
  size: number;
  x: string;
  y: string;
  rotate: number;
};

const desktopShapes: Shape[] = [
  { id: 1, src: "/shapes/green-big.svg", size: 1800, x: "-30%", y: "-35%", rotate: 5 },
];

const mobileShapes: Shape[] = [
  { id: 1, src: "/shapes/green-big.svg", size: 900, x: "-40%", y: "-25%", rotate: 5 },
];

function ShapeLayer({ shapes }: { shapes: Shape[] }) {
  return (
    <>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            transform: `rotate(${shape.rotate}deg)`,
          }}
        >
          <Image
            src={shape.src}
            alt=""
            width={shape.size}
            height={shape.size}
            className="block w-full h-full object-contain border-0 outline-none"
          />
        </div>
      ))}
    </>
  );
}

export default function HRBackground() {
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
      {/* Static shapes on top */}
      <div className="hidden sm:block">
        <ShapeLayer shapes={desktopShapes} />
      </div>
      <div className="block sm:hidden">
        <ShapeLayer shapes={mobileShapes} />
      </div>
    </div>
  );
}
