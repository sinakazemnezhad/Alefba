#!/usr/bin/env python3
"""G1 — live HuggingFace tokenizer fertility vs Alefbâ v1 on held FA probes."""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROBE_PATH = ROOT / "data/eval-probes/alphabet-probes.fa.jsonl"
ORTHO_PATH = ROOT / "data/eval-probes/orthography-probes.fa.jsonl"
BASELINES_PATH = ROOT / "data/eval-baselines.json"
RECEIPT_PATH = ROOT / "data/g1-tokenizer-receipt.json"
RECEIPTS_PATH = ROOT / "data/receipts.json"
HF_REPORT_PATH = ROOT / "data/g1-hf-baseline-report.json"
ALEFBA_MODEL_PATH = ROOT / "data/tokenizer-v1-model.json"

BASELINE_ID = "bloom-560m"
HF_ID = "bigscience/bloom-560m"


def read_jsonl(path: Path):
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def char_count(text: str) -> int:
    return len(re.sub(r"\s+", "", text or ""))


def fertility_probes():
    probes = read_jsonl(PROBE_PATH) + read_jsonl(ORTHO_PATH)
    return [
        p
        for p in probes
        if "full_alphabet_row" not in (p.get("tags") or [])
        and p.get("id") != "a01"
    ]


def fertility_on_texts(tokenizer, texts):
    total_chars = 0
    total_tokens = 0
    per_line = []
    for text in texts:
        ids = tokenizer.encode(text, add_special_tokens=False)
        chars = char_count(text)
        tokens = len(ids)
        total_chars += chars
        total_tokens += tokens
        per_line.append({"chars": chars, "tokens": tokens})
    cpt = round(total_chars / total_tokens, 3) if total_tokens else 0.0
    return {
        "probeCount": len(texts),
        "totalChars": total_chars,
        "totalTokens": total_tokens,
        "charsPerToken": cpt,
        "perLine": per_line,
    }


def load_alefba_vocab():
    if not ALEFBA_MODEL_PATH.exists():
        return None
    model = json.loads(ALEFBA_MODEL_PATH.read_text(encoding="utf-8"))
    vocab = {t: i for i, t in enumerate(model.get("idToToken") or [])}
    return vocab, model


def encode_alefba(text: str, vocab: dict):
    unk = vocab.get("<unk>", 0)
    zwnj_id = vocab.get("<zwnj>", unk)
    tokens = []
    i = 0
    s = text
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


def alefba_fertility(texts, vocab):
    total_chars = 0
    total_tokens = 0
    for text in texts:
        total_chars += char_count(text)
        total_tokens += len(encode_alefba(text, vocab))
    cpt = round(total_chars / total_tokens, 3) if total_tokens else 0.0
    return {
        "probeCount": len(texts),
        "totalChars": total_chars,
        "totalTokens": total_tokens,
        "charsPerToken": cpt,
    }


def main():
    try:
        from transformers import AutoTokenizer
    except ImportError:
        print("RED  transformers not installed — pip install transformers")
        sys.exit(1)

    probes = fertility_probes()
    texts = [p.get("text", "") for p in probes]
    if not texts:
        print("RED  no fertility probes")
        sys.exit(1)

    print(f"Loading HF tokenizer {HF_ID}...")
    bloom = AutoTokenizer.from_pretrained(HF_ID)
    bloom_stats = fertility_on_texts(bloom, texts)

    alefba_stats = None
    model_hash = None
    loaded = load_alefba_vocab()
    if loaded:
        vocab, model = loaded
        alefba_stats = alefba_fertility(texts, vocab)
        import hashlib

        model_hash = hashlib.sha256(
            json.dumps(model.get("idToToken"), ensure_ascii=False).encode()
        ).hexdigest()[:16]

    beats_bloom = (
        alefba_stats is not None
        and alefba_stats["charsPerToken"] >= bloom_stats["charsPerToken"]
    )
    beats_latin = alefba_stats is not None and alefba_stats["charsPerToken"] > 1.944

    at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    hf_report = {
        "gate": "G1",
        "suite": "hf_tokenizer_fertility",
        "at": at,
        "baselineId": BASELINE_ID,
        "huggingfaceId": HF_ID,
        "method": "transformers.AutoTokenizer.encode",
        "fertilityProbeCount": len(probes),
        "excludedProbeIds": ["a01"],
        "bloom560m": bloom_stats,
        "alefba": alefba_stats,
        "compare": {
            "alefbaBeatsBloom560m": beats_bloom,
            "alefbaCharsPerToken": alefba_stats["charsPerToken"] if alefba_stats else None,
            "bloomCharsPerToken": bloom_stats["charsPerToken"],
        },
        "pass": beats_bloom and beats_latin,
    }
    HF_REPORT_PATH.write_text(json.dumps(hf_report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if RECEIPT_PATH.exists():
        receipt = json.loads(RECEIPT_PATH.read_text(encoding="utf-8"))
    else:
        receipt = {"gate": "G1", "metric": "characters_per_token"}

    receipt["at"] = at
    receipt["hfBaseline"] = {
        "baselineId": BASELINE_ID,
        "huggingfaceId": HF_ID,
        "method": "transformers.AutoTokenizer",
        "charsPerToken": bloom_stats["charsPerToken"],
        "totalChars": bloom_stats["totalChars"],
        "totalTokens": bloom_stats["totalTokens"],
        "report": "data/g1-hf-baseline-report.json",
    }
    if "baselines" not in receipt:
        receipt["baselines"] = {}
    receipt["baselines"]["bloom_560m_hf"] = {
        "baselineId": BASELINE_ID,
        "huggingfaceId": HF_ID,
        "method": "hf_autotokenizer",
        **bloom_stats,
        "note": "Live HuggingFace tokenizer run on held fertility probes",
    }
    if alefba_stats:
        receipt["alefba"] = alefba_stats
    receipt["compare"]["beatsBloom560mHf"] = beats_bloom
    receipt["compare"]["bloom560mHfCharsPerToken"] = bloom_stats["charsPerToken"]
    receipt["pass"] = beats_bloom and beats_latin
    receipt["note"] = (
        "G1 fertility receipt — live BLOOM-560m HF tokenizer on held probes."
        if receipt["pass"]
        else "Fertility below live BLOOM-560m HF tokenizer on held probes."
    )
    RECEIPT_PATH.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if BASELINES_PATH.exists():
        baselines_doc = json.loads(BASELINES_PATH.read_text(encoding="utf-8"))
        for b in baselines_doc.get("baselines", []):
            if b.get("id") == BASELINE_ID:
                b["status"] = "hf_tokenizer_run"
                b["charsPerToken"] = bloom_stats["charsPerToken"]
                b["hfRunAt"] = at
            if b.get("id") == "alefba-tokenizer-v1" and alefba_stats:
                b["status"] = "fertility_receipt_hf" if beats_bloom else "fertility_receipt"
                b["charsPerToken"] = alefba_stats["charsPerToken"]
        BASELINES_PATH.write_text(
            json.dumps(baselines_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )

    if RECEIPTS_PATH.exists() and alefba_stats:
        receipts = json.loads(RECEIPTS_PATH.read_text(encoding="utf-8"))
        g1 = next((g for g in receipts.get("gates", []) if g.get("id") == "G1"), None)
        if g1:
            g1["status"] = "pass" if receipt["pass"] else "in_progress"
            g1["probeStatus"] = "hf_baseline_run" if receipt["pass"] else "fertility_receipt"
            g1["hfBaselineReport"] = "data/g1-hf-baseline-report.json"
        card = {
            "date": at[:10],
            "gate": "G1",
            "modelHash": model_hash or receipt.get("modelHash"),
            "split": "public_eval_probes",
            "metric": "chars_per_token",
            "score": alefba_stats["charsPerToken"],
            "baseline": BASELINE_ID,
            "baselineScore": bloom_stats["charsPerToken"],
            "baselineMethod": "hf_autotokenizer",
            "notes": "Alefbâ v1 vs live BLOOM-560m tokenizer on held probes",
        }
        receipts["scoreCards"] = [card] + [
            c for c in receipts.get("scoreCards", []) if c.get("gate") != "G1"
        ]
        receipts["updatedAt"] = at
        receipts["version"] = receipts.get("version", "0.2.8")
        RECEIPTS_PATH.write_text(json.dumps(receipts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    mark = "PASS" if receipt["pass"] else "FAIL"
    print(f"{mark}  tokenizer-fertility-hf-baseline")
    print(f"  alefba {alefba_stats['charsPerToken'] if alefba_stats else '—'} chars/token")
    print(f"  bloom-560m HF {bloom_stats['charsPerToken']} chars/token")
    print(f"  report → {HF_REPORT_PATH}")
    sys.exit(0 if receipt["pass"] else 1)


if __name__ == "__main__":
    main()
