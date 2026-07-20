import type { Metadata } from "next";
import { ClientRedirect } from "@/components/layout/ClientRedirect";

export const metadata: Metadata = {
  title: "Payload Decoder: Redirecting",
  robots: { index: false, follow: true },
};

export default function PayloadDecoderRedirectPage() {
  return <ClientRedirect to="/payload-decode" />;
}
