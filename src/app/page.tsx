import FloatingBackground from "@/components/FloatingBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Interactive Form Prototype
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          背景の図形がふわふわ動いていれば、本日のミッション完了です！
        </p>
      </div>
    </main>
  );
}
