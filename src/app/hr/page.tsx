import { Suspense } from "react";
import Image from "next/image";
import HRBackground from "@/components/HRBackground";
import HRForm from "@/components/HRForm";

export default function HRPage() {
  return (
    <main className="relative min-h-screen">
      <HRBackground />
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
          <HRForm />
        </Suspense>
      </div>
    </main>
  );
}
