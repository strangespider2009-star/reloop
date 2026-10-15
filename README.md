# ReLoop ♻️
### The Repair-First Decision Agent

ReLoop helps people choose a replacement component for an existing device, discover listings across the web, and compare options by compatibility, price, and value — before replacing the whole device.

> **Hackathon MVP:** React + Vite frontend, Express API, TinyFish Search integration, optional TinyFish Agent page extraction, and transparent rule-based ranking. Live listings are research leads, not a guarantee of compatibility or stock. Always verify the exact part number and seller details before buying.

## Features

- Guided flow: device category → brand → model → component.
- TinyFish-powered web discovery using current search results.
- Optional TinyFish Agent extraction from relevant listing pages.
- Results grouped into **Best Overall**, **Best Value**, **Cheapest**, and **Premium**.
- Evidence-aware compatibility labels: `Likely`, `Unverified`, or `Mismatch`.
- Source links, price parsing, sorting, budget cap, and saved shortlist (browser local storage).
- API key remains on the backend.
- Demo mode when `TINYFISH_API_KEY` is not configured; demo results are explicitly labelled.

## Stack

- Frontend: React, Vite, plain CSS
- Backend: Node.js, Express
- Web research: TinyFish Search API; optional TinyFish Agent API
- Tests: Node built-in test runner

## Quick start

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/YOUR_USERNAME/reloop.git
cd reloop
npm install
cp .env.example .env
```

Add your TinyFish API key to `.env`. Get a key from [TinyFish](https://agent.tinyfish.ai/api-keys).

```bash
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:8787`.

On Windows PowerShell, if `cp` does not work:
```powershell
Copy-Item .env.example .env
```

### Demo mode

If no key is set, the app returns clearly labelled sample results so the interface can be shown without live API access. These are not current prices or verified listings.

### Optional Agent enrichment

Set `TINYFISH_AGENT_ENRICHMENT=true` in `.env` to let TinyFish Agent visit the first few relevant search-result pages and attempt structured extraction. Agent runs may be metered and slower. Keep this off during rapid UI iteration; Search alone is the default.

## API

### `GET /api/health`
Returns API and TinyFish configuration status (never reveals the key).

### `POST /api/search`
Example:
```json
{
  "deviceType": "Laptop",
  "brand": "Dell",
  "model": "XPS 13 9310",
  "component": "Battery",
  "country": "IN",
  "budget": 6000
}
```

Response:
```json
{
  "mode": "live",
  "query": "Dell XPS 13 9310 replacement Battery compatible part number price India",
  "results": [],
  "warnings": []
}
```

Each result includes a title, source URL, snippet, optional price and part number, compatibility status, and ranking tags. Price/compatibility fields may be unknown if the source did not expose them.

## TinyFish integration notes

- Search: `GET https://api.search.tinyfish.ai?query=...&location=IN&language=en`
- Authentication: `X-API-Key` header.
- Optional Agent extraction: `POST https://agent.tinyfish.ai/v1/automation/run` with `url`, `goal`, and `browser_profile`.
- API endpoints and request formats follow TinyFish's public cookbook/docs. See [TinyFish Cookbook](https://github.com/tinyfish-io/tinyfish-cookbook).

## GitHub publishing checklist

1. Create a public repository named `reloop`.
2. Upload/push the contents of this folder (not the ZIP itself).
3. Ensure `.env` is not tracked. Only `.env.example` belongs in Git.
4. Add a repository description: `A repair-first decision agent that discovers and compares compatible replacement parts.`
5. Suggested topics: `tinyfish`, `repair`, `sustainability`, `react`, `vite`, `express`, `hackathon`, `right-to-repair`.
6. Add screenshots/GIF to `docs/` after running the app.
7. Add your team members, demo URL, and hackathon details before submission.

## Project structure

```text
reloop/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── tinyfish.js
│   │   ├── ranking.js
│   │   └── demo.js
│   └── test/
│       └── ranking.test.js
├── .env.example
├── .gitignore
└── README.md
```

## Limitations / responsible use

- Search snippets and automated extraction can be incomplete, stale, or wrong.
- A similar model name does not prove electrical, physical, firmware, or regional compatibility.
- ReLoop does not buy parts or guarantee seller legitimacy.
- Confirm exact OEM/FRU/part number, connector, dimensions, voltage, warranty, shipping, and return policy with the seller/manufacturer.
- Respect website terms, rate limits, and robots/access policies. Do not automate checkout or bypass access controls.

## License

MIT — see `LICENSE`.
