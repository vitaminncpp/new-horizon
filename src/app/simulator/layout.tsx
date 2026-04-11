import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CircuitArchitect - Professional Circuit Simulator",
  description:
    "Professional circuit simulation canvas for designing and testing electronic circuits",
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
