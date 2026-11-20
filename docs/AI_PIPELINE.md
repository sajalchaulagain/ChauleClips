# AI pipeline design

**Status:** design document. Stages 1–2 exist only as `system_service` checks today; the pipeline
itself lands in Phases 4–6. This file is the contract those phases implement, so the reasoning is
recorded before the code.

The goal is not "find clips". It is **find three moments a human editor would keep**.

---

## Stage 1 — Media inspection (Phase 3)
`ffprobe -v error -print_format json -show_format -show_streams <file>` returns duration, resolution,
frame rate, codecs, audio streams and aspect ratio. Rejections happen here, never mid-render:

- no video stream, or no audio stream (transcription needs audio),
- unsupported container/codec,
- duration outside `MAX_VIDEO_DURATION_MINUTES`,
- file larger than `MAX_VIDEO_SIZE_MB`,
- corrupted/truncated file (ffprobe returns non-zero).

## Stage 2 — Audio extraction (Phase 4)
`ffmpeg -i input -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav`

Mono 16 kHz is what Whisper expects internally; converting once avoids repeated resampling. Loudness
normalisation is applied only for transcription convenience, never to the source video.

## Stage 3 — Transcription (Phase 4)
faster-whisper on CPU (`WHISPER_MODEL=base`, `WHISPER_COMPUTE_TYPE=int8`).

Stored per project (unique index on `project_id`):

```json
{
  "language": "en",
  "language_probability": 0.98,
  "full_text": "…",
  "segments": [
    { "id": 0, "start": 12.4, "end": 18.9, "text": "…", "words": [{ "word": "so", "start": 12.4, "end": 12.6 }] }
  ],
  "model_used": "base",
  "duration": 1873.2
}
```

Caching matters: changing caption style or clip count must never re-transcribe a 40-minute video.

## Stage 4 — Candidate generation (local, no AI)
Long transcripts are split on natural boundaries (silence gaps, sentence ends, topic shifts), never
on arbitrary character counts. Each chunk keeps a little context on both sides so the model can
judge whether a moment stands alone.

Cheap local heuristics pre-filter obvious non-candidates: long silences, music-only sections,
repeated boilerplate ("subscribe to the channel"), and segments too short for the requested duration.

## Stage 5 — AI analysis (Phase 5)
**One request per transcript chunk**, not one per candidate — a free tier must be respected.

The model is instructed to behave like an experienced short-form editor and must return JSON:

```json
{
  "candidates": [
    {
      "start": 312.5, "end": 352.1, "duration": 39.6,
      "title": "Why most advice fails",
      "description": "Explains the difference between advice that transfers and advice that does not.",
      "hook": "Nobody tells you this about advice.",
      "reason_selected": "Self-contained argument with a clear payoff.",
      "topic": "learning",
      "engagement_score": 8.4, "context_score": 9.0, "hook_score": 8.8, "overall_score": 8.7,
      "caption_emphasis": ["advice that transfers", "context"]
    }
  ]
}
```

Validated with Pydantic: timestamps inside the source duration, `end > start`, duration inside the
requested window, scores in range, no unknown keys. If validation fails, **one** repair request is
made with the schema error; a second failure returns a readable error instead of looping.

## Stage 6 — Local ranking (this is where quality actually comes from)
The AI is a candidate generator; the ranking engine decides.

| Rule | Effect |
|---|---|
| Overlap | candidates overlapping an already-selected clip by > 20% are dropped |
| Topic diversity | prefer different `topic` values across the selection |
| Duration fit | prefer candidates whose duration is inside [min, max] without trimming |
| Sentence boundaries | snap to the nearest segment boundary; never cut mid-word |
| Completeness | drop candidates that start with a dangling reference ("and that's why…") |
| Repetition | drop candidates whose text is close to an already-selected one (token overlap) |
| Silence | trim leading/trailing silence beyond a threshold |
| Score floor | candidates below a configurable `overall_score` are not padded in to reach the count |

If fewer strong candidates exist than requested, the response explains that honestly
("only 2 moments met the quality bar") instead of inventing timestamps.

## Stage 7 — Visual analysis (Phase 6)
OpenCV (optionally PySceneDetect) runs locally on frames sampled around each candidate: scene
changes, face detection, motion, and whether the main subject stays inside a 9:16 crop. Only a short
textual summary ("single speaker, centred, stable framing") is ever sent to the AI. **Frames are
never uploaded.**

This drives *smart framing*: a real per-scene crop path, falling back to a centre crop when no face
is detected.

## Efficiency rules
1. Transcript cached per project; reused for every re-clip.
2. AI results cached per (transcript hash, options hash) so changing a caption colour costs zero
   requests.
3. No AI request for operations that are deterministic (cutting, cropping, caption rendering).
4. Exponential backoff with jitter on 429/5xx; hard retry cap (`OPENROUTER_MAX_RETRIES`).
5. Every request logged to `ai_usage` (model, status, latency, tokens) so quota behaviour is
   visible rather than surprising.
6. One in-flight analysis per project, enforced by a database state transition — no duplicate work
   from double-clicks.

## Prompt library
Versioned files under `backend/app/services/ai/prompts/`, one per content type: podcast, education,
interview, motivational, tutorial, entertainment, storytelling, business. Each is a reusable
instruction set — **not** training or fine-tuning. A small set of evaluation examples
(input excerpt → expected characteristics of a good clip) lives beside them and is used to check
prompt changes, with mocked model responses so tests never consume quota.
