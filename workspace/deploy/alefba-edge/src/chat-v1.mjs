/** G3 chat + design partner routes for edge worker. */

import {
  chatCapabilityDoc,
  handleChatPost,
} from "../../../lib/chat-v1.mjs";
import { parseDesignPartner, validateDesignPartner } from "../../../lib/design-partner-v1.mjs";

export async function handleChatGet(env) {
  return json(chatCapabilityDoc(env.ALEFBA_VERSION || "0.2.8"));
}

export async function handleChatPostRequest(request, env) {
  const started = Date.now();
  const body = await readJson(request);
  const result = handleChatPost(body, env.ALEFBA_VERSION || "0.2.8");
  if (result.usage && env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO api_usage (route, model, input_tokens, output_tokens, latency_ms, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      )
        .bind(
          result.usage.route,
          result.usage.model,
          result.usage.input_tokens,
          result.usage.output_tokens,
          Date.now() - started,
          result.usage.status
        )
        .run();
    } catch {
      /* metering glue — never block */
    }
  }
  return json(result.body, result.status);
}

export async function handleDesignPartnerPost(request, env) {
  const body = await readJson(request);
  const row = parseDesignPartner(body || {});
  const err = validateDesignPartner(row);
  if (err) return json({ ok: false, error: err }, 400);

  if (!env.DB) {
    return json({
      ok: true,
      persisted: false,
      status: "prospect",
      migration: env.MIGRATION_PHASE || "g3_chat_stub",
    }, 201);
  }

  try {
    await env.DB.prepare(
      `INSERT INTO design_partners (org_name, contact_name, contact_email, vertical, notes, status)
       VALUES (?1, ?2, ?3, ?4, ?5, 'prospect')`
    )
      .bind(
        row.orgName,
        row.contactName || null,
        row.contactEmail,
        row.vertical || null,
        row.notes || null
      )
      .run();
    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM design_partners"
    ).first();
    return json({
      ok: true,
      persisted: true,
      status: "prospect",
      designPartnerRows: countRow?.n ?? null,
      migration: env.MIGRATION_PHASE || "g3_chat_stub",
      note: "Gate 3 requires 3 active design partners for instruct MVP.",
    }, 201);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
