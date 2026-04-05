import FloatingBackground from "@/components/FloatingBackground";
import { TestForm } from "@/components/TestForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Interactive Form Prototype
        </h1>
        <TestForm />
      </div>
    </main>
  );
}
