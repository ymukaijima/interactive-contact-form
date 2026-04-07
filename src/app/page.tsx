import FloatingBackground from "@/components/FloatingBackground";
import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <FloatingBackground />
      <div className="relative z-10">
        <AssessmentForm />
      </div>
    </main>
  );
}
