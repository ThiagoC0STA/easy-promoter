/**
 * Maintainer reference for WhatsApp / Instagram URL builders (English).
 * Shown in part on the admin health screen.
 */
export const CHANNEL_URLS_MAINTAINER_DOC = `
WhatsApp (wa.me)
- Input: digits only after stripping non-digits (DDI + DDD + number).
- Output: https://wa.me/{digits}
- Optional pre-filled text uses ?text= with URL-encoded UTF-8 (list uses defaultWhatsappPrefillText in lib/contacts/utils.ts).

Instagram
- Input: @handle or full profile URL.
- Output: https://instagram.com/{handle} when not already http(s).

Touch flow
- Opening the channel does not write last_contacted_at until the user confirms in the modal.
`.trim();
