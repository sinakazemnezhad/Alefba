/** G3 design partner intake — Gate 3 partner counter. */

export function parseDesignPartner(body) {
  const orgName = String(body?.orgName || body?.org_name || "").trim().slice(0, 160);
  const contactEmail = String(body?.contactEmail || body?.contact_email || body?.email || "")
    .trim()
    .slice(0, 180);
  const contactName = String(body?.contactName || body?.contact_name || body?.name || "")
    .trim()
    .slice(0, 120);
  const vertical = String(body?.vertical || body?.useCase || "").trim().slice(0, 120);
  const notes = String(body?.notes || "").trim().slice(0, 2000);
  return { orgName, contactEmail, contactName, vertical, notes };
}

export function validateDesignPartner(row) {
  if (!row.orgName) return "org_name_required";
  if (!row.contactEmail) return "contact_email_required";
  return null;
}
