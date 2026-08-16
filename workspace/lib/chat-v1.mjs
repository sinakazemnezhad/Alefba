/** G3 chat v1 — honest probe stub (not a trained instruct model). */

export const CHAT_PROBE_MODEL = "alefba-probe-v1";

export const READING_PROBES = [
  { id: "r01", text: "آسمان آبی است.", reply: "این جملهٔ کوتاه فارسی است: «آسمان آبی است.» — درک مطلب از الفبا به معنا." },
  { id: "r02", text: "کودک کتاب می‌خواند.", reply: "جملهٔ نمونه: «کودک کتاب می‌خواند.» — مسیر curriculum: حرف → واژه → داستان." },
  { id: "r03", text: "مولوی از شعر حافظ یاد می‌گیرد.", reply: "ادبیات فارسی زنجیرهٔ مولوی و حافظ را در curriculum نگه می‌دارد." },
  { id: "r04", text: "نیم‌فاصله در فارسی مهم است.", reply: "نیم‌فاصله (ZWNJ) بخشی از املای فارسی است — tokenizer الفبا آن را نگه می‌دارد." },
  { id: "r05", text: "فردوسی شاهنامه را سرود.", reply: "شاهنامه فردوسی محور narrative corpus در دروازهٔ پایه است." },
  { id: "r06", text: "سعدی گلستان را نوشت.", reply: "گلستان سعدی نمونهٔ register ادبی در eval probes است." },
];

export function chatCapabilityDoc(version = "0.2.8") {
  return {
    route: "/api/v1/chat",
    version,
    instructMvp: "not_live",
    chatAlpha: "probe_only",
    models: [
      {
        id: CHAT_PROBE_MODEL,
        class: "curriculum_probe",
        note: "Static Persian probe echo for API wiring — not neural inference.",
      },
    ],
    methods: ["POST"],
    body: {
      model: CHAT_PROBE_MODEL,
      messages: [{ role: "user", content: "string" }],
    },
    notLive: {
      status: 503,
      error: "instruct_not_live",
      hint: `Set model to ${CHAT_PROBE_MODEL} for probe wiring tests.`,
      waitlist: "/api/v1/waitlist",
    },
  };
}

function lastUserText(messages) {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m && m.role === "user" && m.content) return String(m.content).trim();
  }
  return "";
}

function matchProbe(userText) {
  const norm = userText.replace(/\s+/g, " ").trim();
  if (!norm) return READING_PROBES[0];
  const hit = READING_PROBES.find((p) => norm.includes(p.text) || p.text.includes(norm));
  return hit || READING_PROBES[0];
}

export function estimateTokens(text) {
  const s = String(text || "");
  return Math.max(1, Math.ceil(s.length / 4));
}

export function handleChatPost(body, version = "0.2.8") {
  const model = String(body?.model || "").trim();
  const messages = body?.messages;

  if (model !== CHAT_PROBE_MODEL) {
    return {
      status: 503,
      body: {
        ok: false,
        error: "instruct_not_live",
        instructMvp: "not_live",
        chatAlpha: "probe_only",
        hint: `Use model ${CHAT_PROBE_MODEL} for wiring tests until Gate 3 instruct MVP.`,
        waitlist: "/api/v1/waitlist",
        gates: { G3: "pending" },
      },
    };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      status: 400,
      body: { ok: false, error: "messages_required" },
    };
  }

  const userText = lastUserText(messages);
  const probe = matchProbe(userText);
  const assistantContent = probe.reply;
  const inputTokens = estimateTokens(JSON.stringify(messages));
  const outputTokens = estimateTokens(assistantContent);

  return {
    status: 200,
    body: {
      ok: true,
      model: CHAT_PROBE_MODEL,
      class: "curriculum_probe",
      instructMvp: "not_live",
      probeId: probe.id,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      message: { role: "assistant", content: assistantContent },
      note: "Static probe echo — not a trained instruct model. Gate 3 lift pending.",
    },
    usage: {
      route: "/api/v1/chat",
      model: CHAT_PROBE_MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      status: "ok",
    },
  };
}
