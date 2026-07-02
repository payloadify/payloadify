import type { Metadata } from "next";
import { ClientRedirect } from "@/components/layout/ClientRedirect";

export const metadata: Metadata = {
  title: "Payload Encoder — Redirecting",
  robots: { index: false, follow: true },
};

export default function PayloadEncoderRedirectPage() {
  return <ClientRedirect to="/payload-encode" />;
}
