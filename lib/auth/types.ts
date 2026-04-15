export type ProfileRole = "promoter" | "super_admin";

export type Profile = {
  id: string;
  display_name: string | null;
  role: ProfileRole;
  created_at: string;
};
