# Design and UX checklist (Easy Promoter)



Use this list to track polish before client delivery. Items marked done were started in the repo as of the last edit to this file.



## Visual design



- [x] Reduce competing decorative layers (background blob, stacked gradients). Prefer one calm motif.

- [x] Primary actions use theme tokens so light and dark stay coherent (accent-driven gradient).

- [x] Card hover states stay subtle on dense lists (no lift on every row).

- [x] Unify radius scale: `--radius-control` (12px) for inputs and `.btn-secondary`; `--radius-card` for list rows; primary CTA stays pill.

- [x] Replace remaining hardcoded brand hex in key surfaces (dashboard mini-stat, login, admin header icon, marketing hero orbs and CTA) with theme tokens.

- [x] Marketing landing uses the same accent variables as the app (orbs and gradients tied to `--color-accent`).



## Layout and hierarchy



- [x] Page subtitles describe the task, not session metadata (email stays in the header).

- [x] Contacts list: toolbar region groups search, filters, and primary CTA.

- [x] Dashboard charts section: intro line when the base is empty vs when it has contacts.



## UX and content



- [x] Dashboard hero communicates total priority count when relevant (next step to open list or scroll).

- [x] Light hint for filter discoverability on the contacts list.

- [x] After destructive actions, confirm impact in plain language (delete contact flow).

- [x] Server action errors: user-facing message plus dismissible banner via `?error=`; touch channel returns `{ ok, message }` in the modal.

- [x] Mobile: larger tap targets on channel and edit controls in the contact row (min 44px).

- [x] Keyboard: `/` focuses search; Esc closes filter panel and returns focus to the toggle.



## Theming and accessibility



- [x] Dark mode: slightly separate `border-subtle` from surface so borders remain visible.

- [x] Tertiary text and accent-muted tints nudged for readability (light and dark).

- [x] Keep skip link and focus rings consistent when new interactive regions are added.



## Admin vs promoter



- [x] Admin area: top banner plus icon so it feels distinct from day-to-day CRM tasks.



## Still open (optional next pass)

- [x] Admin invite API: responses in Portuguese, `ok: false` on errors, Supabase messages mapped (`lib/admin/invite-user-messages.ts`). Client handles network and invalid JSON.

- [x] Main cards and panels use `rounded-[var(--radius-card)]` or `rounded-[var(--radius-control)]` where it matched the old scale.

- [ ] Broader contrast audit: run a WCAG checker (for example Lighthouse or axe) on `/`, `/login`, `/app`, `/app/contacts`, and `/admin` after visual freezes.


