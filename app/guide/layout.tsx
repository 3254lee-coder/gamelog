import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "육지거북 사육 가이드" };
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
