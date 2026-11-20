import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { isDemoMode } from "@/lib/env";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <AuthLayout title="Crie sua conta" subtitle="Falta pouco para começar sua jornada.">
      <SignupForm demo={isDemoMode} />
    </AuthLayout>
  );
}
