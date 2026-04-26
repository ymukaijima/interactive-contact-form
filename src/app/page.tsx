import { Suspense } from "react";
import Image from "next/image";
import FloatingBackground from "@/components/FloatingBackground";
import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />
      <div className="relative z-10">
        <header className="pt-6 px-6 md:px-12 flex justify-end">
          <Image
            src="/logo/logo_black.png"
            alt="Logo"
            width={140}
            height={40}
            className="object-contain"
          />
        </header>
        <Suspense>
          <AssessmentForm />
        </Suspense>
      </div>
    </main>
  );
}
