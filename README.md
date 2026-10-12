# Personal academic portfolio

A plain static site: HTML, CSS and vanilla JavaScript. No Node, no npm, no build step, no frameworks. All content lives in `data/*.json`; pages read it and render the lists, so adding an item means adding one JSON entry and never editing HTML.

## Replace these placeholders first

| Where | What to supply |
|---|---|
| `data/site.json` | your name, email (`REPLACE-ME@example.com`), LinkedIn URL, optional Scholar URL, and the 3 intro lines (check they say what you want) |
| `assets/cv.pdf` | your real CV (keep the file name; the included file is a stub) |
| `data/demos.json` | real sentences and audio files (the sample entry points to files that do not exist yet) |
| `data/notes.json` | the sample note marked `[PLACEHOLDER]` |
| `data/research.json` | check the motivation, questions and status rows match where the project really stands |

The GitHub link in `data/site.json` is `https://github.com/Sudiptabain75`; change it if that is not your profile.

## Folder layout

```
index.html research.html demos.html projects.html papers.html notes.html cv.html contact.html
css/style.css      js/main.js  js/theme.js
data/              site, updates, projects, demos, notes, papers, research (.json)
assets/cv.pdf      assets/audio/
```

The top nav, footer and theme toggle are injected by `js/main.js`, so they are identical on every page. To add or rename a nav item, edit the `NAV` list at the top of `js/main.js`.

## Adding content

Each file is a JSON array. Add a new object, separate objects with commas, and keep the quotes. Optional fields may be left out.

**Update** (`data/updates.json`; Home shows the first 6, so put newest first). `status` is `Planned`, `In progress` or `Done`.
```json
{ "date": "2026-11-02", "title": "Finished the ASR step", "status": "Done", "tags": ["ASR"] }
```

**Paper** (`data/papers.json`). `type` is `"mine"` (section "My papers") or `"reading"` (section "Reading notes"). Filter chips on the Papers page are built automatically from every tag used. A section heading is hidden when it has no items (including under the current filter), so "My papers" appears as soon as you add a `"mine"` entry.
```json
{
  "type": "mine",
  "title": "Paper title",
  "authors": "You, Coauthor",
  "venue": "Workshop name",
  "year": 2027,
  "summary": "One or two sentences.",
  "tags": ["S2ST", "prosody"],
  "links": { "pdf": "https://...", "code": "https://github.com/...", "arXiv": "https://arxiv.org/abs/..." }
}
```

**Project** (`data/projects.json`)
```json
{ "title": "Name", "description": "What it is.", "status": "In progress",
  "tags": ["TTS"], "links": { "code": "https://github.com/...", "demo": "demos.html" } }
```

**Demo** (`data/demos.json`). Put audio in `assets/audio/` and use paths relative to the site root. An empty string shows a dash instead of a player.
```json
{ "sentence": "Text of the line", "note": "Korean to Bangla, angry",
  "original": "assets/audio/s2_original.wav",
  "baseline": "assets/audio/s2_baseline.wav",
  "ours": "assets/audio/s2_ours.wav" }
```
Use short clips (MP3 or WAV, ideally under 1 MB each). Players load on demand (`preload="none"`).

**Note** (`data/notes.json`). `url` is optional; with it the title becomes a link (for example a PDF in `assets/` or a blog post).
```json
{ "title": "Notes on prosody features", "date": "2026-11-05", "summary": "Short summary.", "tags": ["prosody"], "url": "assets/notes/prosody.pdf" }
```

**Research page** (`data/research.json`): edit the motivation paragraphs, the pipeline stages (set `"focus": true` on the stage to highlight), the questions and the status rows.

## Preview locally (optional)

Browsers block `fetch` on `file://` pages, so opening the HTML directly shows an error banner. Serve the folder instead, for example `python3 -m http.server` inside this folder, then open http://localhost:8000. No install needed.

## Publish on GitHub Pages

1. Create a GitHub repository and push this folder's contents to the repository root (`index.html` must be at the top level).
2. On GitHub: **Settings, Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose branch `main` and folder `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<username>.github.io/<repo>/` (or `https://<username>.github.io/` if the repo is named `<username>.github.io`).

All paths in the site are relative, so it works under a repo sub-path. The empty `.nojekyll` file tells GitHub to serve files as they are.
