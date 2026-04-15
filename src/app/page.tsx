import { Suspense } from "react";
import FloatingBackground from "@/components/FloatingBackground";
import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />
      <div className="relative z-10">
        <Suspense>
          <AssessmentForm />
        </Suspense>
      </div>
    </main>
  );
}
