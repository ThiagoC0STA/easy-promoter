import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-profile";

export default async function PromoterAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
