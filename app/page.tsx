import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LandingView } from "@/components/marketing/landing-view";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingView user={user} />;
}
