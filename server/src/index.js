import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { searchReplacementParts } from "./tinyfish.js";
import { demoResults } from "./demo.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "30kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "reloop-api",
    tinyfishConfigured: Boolean(process.env.TINYFISH_API_KEY),
    agentEnrichmentEnabled: process.env.TINYFISH_AGENT_ENRICHMENT === "true"
  });
});

app.post("/api/search", async (req, res) => {
  const { deviceType, brand, model, component, country = "IN", budget = null } = req.body || {};
  const required = { deviceType, brand, model, component };
  const missing = Object.entries(required).filter(([, value]) => typeof value !== "string" || !value.trim()).map(([key]) => key);
  if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  if (model.length > 160 || brand.length > 80 || component.length > 100 || deviceType.length > 80) {
    return res.status(400).json({ error: "One or more fields exceed the allowed length." });
  }
  const allowedCountries = new Set(["IN", "US", "GB", "CA"]);
  if (!allowedCountries.has(country)) return res.status(400).json({ error: "Unsupported market. Choose IN, US, GB, or CA." });
  if (budget !== null && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
    return res.status(400).json({ error: "Budget must be a non-negative number or null." });
  }

  const input = { deviceType: deviceType.trim(), brand: brand.trim(), model: model.trim(), component: component.trim(), country, budget };
  if (!process.env.TINYFISH_API_KEY) {
    return res.json({
      mode: "demo",
      query: `${input.brand} ${input.model} replacement ${input.component} compatible part number price`,
      results: demoResults(input),
      warnings: ["Demo mode: add TINYFISH_API_KEY to .env to search the live web. Sample listings and prices are illustrative, not current offers."]
    });
  }

  try {
    const payload = await searchReplacementParts(input);
    res.json({ mode: "live", ...payload });
  } catch (error) {
    console.error("TinyFish search failed:", error.message);
    res.status(502).json({
      error: "TinyFish search could not be completed. Check your API key, account limits, and network, then retry.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err.message);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () => console.log(`ReLoop API listening on http://localhost:${port}`));
