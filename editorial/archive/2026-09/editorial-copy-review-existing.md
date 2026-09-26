# Existing structured copy review

> Historical review. For current personality and public-copy guidance, use [Ohio-chan’s voice guide](../site/editorial/voice-guide.md), confirmed 2026-09-26: introduce the subject, express a specific taste, and occasionally add gentle flirt. This dated review remains evidence of its original scope, not the current voice specification.

Reviewed the current structured copy in `site/src/data/guide.json`, `extra-stories.json`, `guided-tours.json`, `scene-guidance.json`, `scene-summaries.json`, and `worlds.json`. Also inspected the root `content-draft.json` for stale-copy conflicts. This review covers prose, labels, repeated welcomes, wording consistency, and contradictions visible within these files; it was not an external fact-check of every linked source.

## Changes made

- Removed “Hi, I’m Ohio-chan!” from both `guided-tours.json` chapter welcomes. The character introduction belongs on the homepage; each chapter now opens on its subject.
- Tightened the Explore welcome so it no longer promises to “show” the user twice.
- Removed repeated invitations and conclusions in `guide.json` and `extra-stories.json`, including the doubled history point, the repeated wildlife closing, and duplicate “give these stories time” lines.
- Replaced “Hey, I found a city shaped by kilns” with a concrete East Liverpool pottery lead, avoiding an invented first-hand discovery claim.
- Cut repeated lead-ins in the Toledo port, Severance, Statehouse, Freedom Center, and OhioLINK entries. Preserved the underlying place and program facts.
- Left `scene-guidance.json`, `scene-summaries.json`, and `worlds.json` unchanged after review; their short copy does not repeat the character introduction or contain an evident internal contradiction.

## Legacy draft

`content-draft.json` is a pre-expansion editorial snapshot, separate from the current `site/src/data` content. The subsequent primary-agent pass corrected the Cuyahoga Valley lead and removed duplicated self-introductions from the Explore and Live expansion drafts. These files remain archival; current page copy lives in `site/src/`.

## Review notes

I found no unresolved contradiction between the current structured files. Time-sensitive access and schedule details are generally framed as items to check with the venue or official source. All six current JSON files parsed successfully after editing.
