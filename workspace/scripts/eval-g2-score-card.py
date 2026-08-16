#!/usr/bin/env python3
"""G2 — Persian orthography / morphology / reading proxy score card vs BLOOM-560m HF."""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORTHO_PATH = ROOT / "data/eval-probes/orthography-probes.fa.jsonl"
MORPH_PATH = ROOT / "data/eval-probes/morphology-probes.fa.jsonl"
READING_PATH = ROOT / "data/eval-probes/reading-probes.fa.jsonl"
ALEFBA_MODEL_PATH = ROOT / "data/tokenizer-v1-model.json"
BASELINES_PATH = ROOT / "data/eval-baselines.json"
RECEIPTS_PATH = ROOT / "data/receipts.json"
SCORE_CARD_PATH = ROOT / "data/g2-score-card.json"
ORTHO_REPORT_PATH = ROOT / "data/g2-orthography-report.json"

BASELINE_ID = "bloom-560m"
HF_ID = "bigscience/bloom-560m"


def read_jsonl(path: Path):
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def normalize_fa(text: str) -> str:
    t = text or ""
    t = t.replace("ي", "ی").replace("ك", "ک")
    t = re.sub(r"\s+", "", t)
    return t


def load_alefba():
    if not ALEFBA_MODEL_PATH.exists():
        return None
    model = json.loads(ALEFBA_MODEL_PATH.read_text(encoding="utf-8"))
    id_to_token = model.get("idToToken") or []
    vocab = {t: i for i, t in enumerate(id_to_token)}
    return model, vocab, id_to_token


def encode_alefba(text: str, vocab: dict):
    unk = vocab.get("<unk>", 0)
    zwnj_id = vocab.get("<zwnj>", unk)
    tokens = []
    i = 0
    s = text or ""
    while i < len(s):
        if s[i] == "\u200c":
            tokens.append(zwnj_id)
            i += 1
            continue
        if s[i] == " ":
            i += 1
            continue
        matched = None
        for length in range(min(32, len(s) - i), 0, -1):
            piece = s[i : i + length]
            if piece in vocab:
                matched = piece
                break
        if matched:
            tokens.append(vocab[matched])
            i += len(matched)
        else:
            tokens.append(vocab.get(s[i], unk))
            i += 1
    return tokens


def decode_alefba(ids, id_to_token):
    parts = []
    for idx in ids:
        if idx < 0 or idx >= len(id_to_token):
            continue
        t = id_to_token[idx]
        if t == "<zwnj>":
            parts.append("\u200c")
        elif t.startswith("<") and t.endswith(">"):
            continue
        else:
            parts.append(t)
    return "".join(parts)


def round_trip_fidelity(text: str, encode_fn, decode_fn):
    ids = encode_fn(text)
    decoded = decode_fn(ids)
    src = normalize_fa(text)
    dst = normalize_fa(decoded)
    if src == dst:
        return True, decoded
    if src and dst and src in dst or dst in src:
        return True, decoded
    return False, decoded


def orthography_pass(probe, decoded: str, original: str) -> bool:
    expected = probe.get("expected")
    if expected and expected not in decoded and normalize_fa(expected) not in normalize_fa(decoded):
        return False
    if "\u200c" in original and "\u200c" not in decoded:
        return False
    if probe.get("probe") in ("arabic_kaf", "arabic_yeh"):
        return "ی" in decoded or "ک" in decoded
    return normalize_fa(original) == normalize_fa(decoded)


def morph_pass(probe, encode_fn, decode_fn) -> bool:
    text = probe.get("text", "")
    base = probe.get("base", "")
    ok_form, _ = round_trip_fidelity(text, encode_fn, decode_fn)
    if not ok_form:
        return False
    if base:
        base_ids = encode_fn(base)
        form_ids = encode_fn(text)
        if base_ids == form_ids:
            return False
    return True


def reading_pass(probe, encode_fn, decode_fn) -> bool:
    text = probe.get("text", "")
    keywords = probe.get("keywords") or []
    ok, decoded = round_trip_fidelity(text, encode_fn, decode_fn)
    if not ok:
        return False
    for kw in keywords:
        if kw not in decoded and normalize_fa(kw) not in normalize_fa(decoded):
            return False
    return True


def score_suite(probes, pass_fn, encode_fn, decode_fn):
    results = []
    for p in probes:
        passed = pass_fn(p, encode_fn, decode_fn)
        results.append({"id": p.get("id"), "pass": passed})
    passed = sum(1 for r in results if r["pass"])
    total = len(results)
    pct = round((passed / total) * 100, 1) if total else 0.0
    return {
        "probeCount": total,
        "passed": passed,
        "fidelityPct": pct,
        "results": results,
    }


def main():
    try:
        from transformers import AutoTokenizer
    except ImportError:
        print("RED  transformers not installed — pip install transformers")
        sys.exit(1)

    ortho = read_jsonl(ORTHO_PATH)
    morph = read_jsonl(MORPH_PATH)
    reading = read_jsonl(READING_PATH)
    if len(ortho) < 5 or len(morph) < 5 or len(reading) < 5:
        print("RED  G2 probe suites incomplete")
        sys.exit(1)

    loaded = load_alefba()
    if not loaded:
        print("RED  alefba tokenizer model missing")
        sys.exit(1)
    model, vocab, id_to_token = loaded

    import hashlib

    model_hash = hashlib.sha256(
        json.dumps(model.get("idToToken"), ensure_ascii=False).encode()
    ).hexdigest()[:16]

    def alefba_encode(t):
        return encode_alefba(t, vocab)

    def alefba_decode(ids):
        return decode_alefba(ids, id_to_token)

    bloom = AutoTokenizer.from_pretrained(HF_ID)

    def bloom_encode(t):
        return bloom.encode(t, add_special_tokens=False)

    def bloom_decode(ids):
        return bloom.decode(ids, skip_special_tokens=True)

    def ortho_pass_fn(probe, encode_fn, decode_fn):
        text = probe.get("text", "")
        ids = encode_fn(text)
        decoded = decode_fn(ids)
        return orthography_pass(probe, decoded, text)

    alefba_ortho = score_suite(ortho, ortho_pass_fn, alefba_encode, alefba_decode)
    bloom_ortho = score_suite(ortho, ortho_pass_fn, bloom_encode, bloom_decode)
    alefba_morph = score_suite(morph, morph_pass, alefba_encode, alefba_decode)
    bloom_morph = score_suite(morph, morph_pass, bloom_encode, bloom_decode)
    alefba_read = score_suite(reading, reading_pass, alefba_encode, alefba_decode)
    bloom_read = score_suite(reading, reading_pass, bloom_encode, bloom_decode)

    suites = {
        "orthography": {"alefba": alefba_ortho, "bloom560m": bloom_ortho},
        "morphology": {"alefba": alefba_morph, "bloom560m": bloom_morph},
        "reading_proxy": {"alefba": alefba_read, "bloom560m": bloom_read},
    }

    lifts = {}
    beats = {}
    for name, data in suites.items():
        a = data["alefba"]["fidelityPct"]
        b = data["bloom560m"]["fidelityPct"]
        lifts[name] = round(a - b, 1)
        beats[name] = a >= b

    composite_alefba = round(
        sum(s["alefba"]["fidelityPct"] for s in suites.values()) / len(suites), 1
    )
    composite_bloom = round(
        sum(s["bloom560m"]["fidelityPct"] for s in suites.values()) / len(suites), 1
    )
    composite_lift = round(composite_alefba - composite_bloom, 1)
    pass_card = composite_alefba >= composite_bloom and all(beats.values())

    at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    ortho_report = {
        "gate": "G2",
        "suite": "orthography_morph_reading_proxy",
        "at": at,
        "baselineId": BASELINE_ID,
        "huggingfaceId": HF_ID,
        "method": "round_trip_tokenizer_fidelity",
        "suites": suites,
        "composite": {
            "alefbaFidelityPct": composite_alefba,
            "bloom560mFidelityPct": composite_bloom,
            "liftPct": composite_lift,
        },
        "lifts": lifts,
        "beatsBloom560m": beats,
        "pass": pass_card,
        "note": "Tokenizer proxy score card — not a trained base model eval.",
    }
    ORTHO_REPORT_PATH.write_text(
        json.dumps(ortho_report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    score_card = {
        "version": "0.2.8",
        "gate": "G2",
        "date": at[:10],
        "at": at,
        "split": "public_eval_probes_ortho_morph_reading",
        "modelId": "alefba-tokenizer-v1",
        "modelHash": model_hash,
        "baseline": BASELINE_ID,
        "baselineMethod": "hf_autotokenizer_round_trip",
        "metric": "composite_fidelity_pct",
        "score": composite_alefba,
        "baselineScore": composite_bloom,
        "liftPct": composite_lift,
        "suites": {
            k: {
                "alefbaPct": v["alefba"]["fidelityPct"],
                "bloom560mPct": v["bloom560m"]["fidelityPct"],
                "liftPct": lifts[k],
            }
            for k, v in suites.items()
        },
        "class": "tokenizer_proxy",
        "published": True,
        "pass": pass_card,
        "note": "First G2 score card — orthography/morphology/reading proxy on held probes. Base model lift pending M8.",
        "report": "data/g2-orthography-report.json",
    }
    SCORE_CARD_PATH.write_text(json.dumps(score_card, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if RECEIPTS_PATH.exists():
        receipts = json.loads(RECEIPTS_PATH.read_text(encoding="utf-8"))
        g2 = next((g for g in receipts.get("gates", []) if g.get("id") == "G2"), None)
        if g2:
            g2["status"] = "in_progress"
            g2["scoreCard"] = "data/g2-score-card.json"
            g2["orthographyReport"] = "data/g2-orthography-report.json"
            g2["probeStatus"] = "tokenizer_proxy_published"
            g2["note"] = (
                "Tokenizer proxy score card published on held probes. "
                "Base model ortho/morph/reading lift vs fair baseline still pending M8."
            )
        card = {
            "date": at[:10],
            "gate": "G2",
            "modelHash": model_hash,
            "split": score_card["split"],
            "metric": "composite_fidelity_pct",
            "score": composite_alefba,
            "baseline": BASELINE_ID,
            "baselineScore": composite_bloom,
            "baselineMethod": "hf_autotokenizer_round_trip",
            "liftPct": composite_lift,
            "notes": score_card["note"],
        }
        receipts["scoreCards"] = [
            c for c in receipts.get("scoreCards", []) if c.get("gate") != "G2"
        ] + [card]
        receipts["updatedAt"] = at
        RECEIPTS_PATH.write_text(json.dumps(receipts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if BASELINES_PATH.exists():
        baselines_doc = json.loads(BASELINES_PATH.read_text(encoding="utf-8"))
        for b in baselines_doc.get("baselines", []):
            if b.get("id") == BASELINE_ID:
                b["g2ProxyRunAt"] = at
                b["g2CompositeFidelityPct"] = composite_bloom
        baselines_doc["updatedAt"] = at[:10]
        BASELINES_PATH.write_text(
            json.dumps(baselines_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )

    mark = "PASS" if pass_card else "FAIL"
    print(f"{mark}  eval-g2-score-card")
    print(f"  composite alefba {composite_alefba}% · bloom {composite_bloom}% · lift {composite_lift}%")
    for name in suites:
        print(
            f"  {name}: alefba {suites[name]['alefba']['fidelityPct']}% "
            f"bloom {suites[name]['bloom560m']['fidelityPct']}%"
        )
    print(f"  score card → {SCORE_CARD_PATH}")
    sys.exit(0 if pass_card else 1)


if __name__ == "__main__":
    main()
