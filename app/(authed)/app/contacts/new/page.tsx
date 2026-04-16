import { redirect } from "next/navigation";

type SearchParams = { error?: string | string[] };

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  q.set("novo", "1");
  const raw = params.error;
  if (typeof raw === "string" && raw.length > 0) {
    q.set("error", raw);
  }
  redirect(`/app/contacts?${q.toString()}`);
}
