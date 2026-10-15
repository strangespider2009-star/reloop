import { useMemo, useState } from "react";

const deviceOptions = {
  Laptop: {
    brands: ["Dell", "HP", "Lenovo", "ASUS", "Acer", "Apple", "Other"],
    components: ["Battery", "Display / Screen", "SSD", "RAM", "Keyboard", "Charger", "Cooling fan"]
  },
  Smartphone: {
    brands: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Vivo", "OPPO", "Other"],
    components: ["Battery", "Display / Screen", "Charging port", "Back cover", "Camera module", "Charger"]
  },
  Tablet: {
    brands: ["Apple", "Samsung", "Lenovo", "Xiaomi", "Other"],
    components: ["Battery", "Display / Screen", "Charging port", "Charger"]
  },
  "Desktop PC": {
    brands: ["Custom build", "Dell", "HP", "Lenovo", "Other"],
    components: ["SSD", "RAM", "Power supply", "GPU", "CPU cooler", "Motherboard"]
  },
  "Gaming console": {
    brands: ["Sony", "Microsoft", "Nintendo", "Other"],
    components: ["Storage", "Controller", "Power supply", "Cooling fan", "HDMI port"]
  }
};

const money = (value, currency = "INR") => {
  if (value == null || !Number.isFinite(Number(value))) return "Price not found";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `₹${Math.round(value)}`; }
};

function App() {
  const [deviceType, setDeviceType] = useState("Laptop");
  const [brand, setBrand] = useState("Dell");
  const [model, setModel] = useState("");
  const [component, setComponent] = useState("Battery");
  const [country, setCountry] = useState("IN");
  const [budget, setBudget] = useState("");
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("");
  const [query, setQuery] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [shortlist, setShortlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reloop-shortlist") || "[]"); } catch { return []; }
  });
  const [showShortlist, setShowShortlist] = useState(false);
  const choices = deviceOptions[deviceType];

  const visibleResults = useMemo(() => {
    let list = results.filter((item) => filter === "All" || (item.tags || []).includes(filter));
    if (budget !== "" && Number(budget) >= 0) list = list.filter((item) => item.price == null || item.price <= Number(budget));
    if (sort === "price-low") list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "compatibility") list = [...list].sort((a, b) => Number(b.compatibility === "Likely") - Number(a.compatibility === "Likely"));
    return list;
  }, [results, filter, sort, budget]);

  function updateDeviceType(value) {
    setDeviceType(value);
    setBrand(deviceOptions[value].brands[0]);
    setComponent(deviceOptions[value].components[0]);
  }

  async function searchParts(event) {
    event.preventDefault();
    setError("");
    setWarnings([]);
    setResults([]);
    if (!model.trim()) { setError("Enter the exact model name or model number to improve compatibility matching."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceType, brand, model: model.trim(), component, country, budget: budget === "" ? null : Number(budget) })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Search failed. Please try again.");
      setResults(payload.results || []);
      setMode(payload.mode || "live");
      setQuery(payload.query || "");
      setWarnings(payload.warnings || []);
      if (!payload.results?.length) setError("No listings were found. Try the full model number, a known part number, or a broader component name.");
    } catch (err) {
      setError(err.message || "Could not connect to ReLoop API.");
    } finally {
      setLoading(false);
    }
  }

  function toggleShortlist(item) {
    const exists = shortlist.some((entry) => entry.url === item.url);
    const next = exists ? shortlist.filter((entry) => entry.url !== item.url) : [...shortlist, item];
    setShortlist(next);
    localStorage.setItem("reloop-shortlist", JSON.stringify(next));
  }

  const displayResults = showShortlist ? shortlist : visibleResults;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brandmark" href="#" aria-label="ReLoop home"><span className="brand-icon">↻</span><span>reloop<span className="brand-dot">.</span></span></a>
        <nav><a href="#how-it-works">How it works</a><button className="nav-shortlist" onClick={() => setShowShortlist(!showShortlist)}>Shortlist <span>{shortlist.length}</span></button></nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot"></span> THE REPAIR-FIRST DECISION AGENT</div>
            <h1>Don't replace it.<br /><span>ReLoop it.</span></h1>
            <p>Find the right replacement part for your device. Compare compatibility, prices, and value across the web — then make a smarter repair decision.</p>
            <div className="hero-proof"><span>✳ Compatibility-first</span><span>↗ Multi-source search</span><span>♻ Less e-waste</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
            <div className="device device-laptop"><div className="laptop-screen"><span>↻</span></div><div className="laptop-base"></div></div>
            <div className="part part-chip">SSD <b>↗</b></div><div className="part part-battery">▰ <small>BATTERY</small></div>
            <div className="floating-leaf">♻</div>
          </div>
        </section>

        <section className="search-panel" id="search">
          <div className="section-heading"><div><span className="step-label">01 / YOUR DEVICE</span><h2>What needs fixing?</h2></div><span className="secure-label">✦ Powered by TinyFish</span></div>
          <form onSubmit={searchParts}>
            <div className="form-grid">
              <label>Device type
                <select value={deviceType} onChange={(e) => updateDeviceType(e.target.value)}>{Object.keys(deviceOptions).map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label>Brand
                <select value={brand} onChange={(e) => setBrand(e.target.value)}>{choices.brands.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="model-field">Exact model
                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Dell XPS 13 9310" required />
              </label>
              <label>Component
                <select value={component} onChange={(e) => setComponent(e.target.value)}>{choices.components.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label>Market
                <select value={country} onChange={(e) => setCountry(e.target.value)}><option value="IN">India (INR)</option><option value="US">United States (USD)</option><option value="GB">United Kingdom (GBP)</option><option value="CA">Canada (CAD)</option></select>
              </label>
              <label>Budget (optional)
                <div className="budget-input"><span>{country === "IN" ? "₹" : country === "US" ? "$" : country === "GB" ? "£" : "C$"}</span><input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="No limit" /></div>
              </label>
            </div>
            <button className="search-button" type="submit" disabled={loading}>{loading ? <><span className="spinner"></span> Searching the web…</> : <>Find compatible parts <span>↗</span></>}</button>
            <p className="form-footnote">Use the full model number for better results. ReLoop does not guarantee compatibility until the exact part number is verified.</p>
          </form>
        </section>

        {(results.length > 0 || showShortlist) && <section className="results-section" id="results">
          <div className="results-header"><div><span className="step-label">02 / YOUR OPTIONS</span><h2>{showShortlist ? "Your shortlist" : "Compare before you repair."}</h2><p>{showShortlist ? `${shortlist.length} saved listing(s)` : `${results.length} result(s) · ${mode === "demo" ? "Demo data — not live offers" : "Live web research"}`}</p></div>
            {!showShortlist && <label className="sort-control">Sort by<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="compatibility">Compatibility evidence</option></select></label>}
          </div>
          {!showShortlist && <div className="filter-row">{["All", "Best Overall", "Best Value", "Cheapest", "Premium"].map((item) => <button key={item} className={`filter-chip ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>}
          {warnings.map((warning, i) => <div className="notice" key={i}>ⓘ {warning}</div>)}
          {query && !showShortlist && <p className="query-note">Search query: <code>{query}</code></p>}
          <div className="product-grid">
            {displayResults.map((item, index) => <article className="product-card" key={item.url || `${item.title}-${index}`}>
              <div className="product-card-top"><span className={`compat-badge ${item.compatibility === "Likely" ? "likely" : item.compatibility === "Mismatch" ? "mismatch" : ""}`}>{item.compatibility || "Unverified"} match</span><button className={`save-button ${shortlist.some((entry) => entry.url === item.url) ? "saved" : ""}`} title="Save to shortlist" onClick={() => toggleShortlist(item)}>{shortlist.some((entry) => entry.url === item.url) ? "♥" : "♡"}</button></div>
              <div className="product-symbol">{item.symbol || "◈"}</div>
              <h3>{item.title}</h3><p className="product-source">{item.source || "Web listing"}</p>
              <div className="product-price">{money(item.price, item.currency || (country === "IN" ? "INR" : country === "US" ? "USD" : country === "GB" ? "GBP" : "CAD"))}</div>
              {item.partNumber && <p className="part-number">Part no. <b>{item.partNumber}</b></p>}
              <p className="product-snippet">{item.snippet || "Open the source listing to verify the exact specifications."}</p>
              <div className="tag-row">{(item.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
              {item.compatibilityEvidence && <p className="evidence"><b>Evidence:</b> {item.compatibilityEvidence}</p>}
              <a className="source-link" href={item.url} target="_blank" rel="noreferrer">Check listing <span>↗</span></a>
            </article>)}
          </div>
          {displayResults.length === 0 && <div className="empty-state"><span>♡</span><h3>{showShortlist ? "Nothing saved yet" : "No results in this filter"}</h3><p>{showShortlist ? "Save listings with the heart icon to compare them here." : "Try another category or remove your budget limit."}</p></div>}
          <p className="disclaimer">Prices, availability, seller claims and compatibility can change. Confirm the exact OEM/FRU/part number, connector, dimensions, warranty and return policy before ordering.</p>
        </section>}

        {error && <div className="error-banner" role="alert">{error}</div>}

        <section className="how-section" id="how-it-works"><div className="section-heading"><div><span className="step-label">THE RELOOP METHOD</span><h2>Repair smarter. Waste less.</h2></div></div>
          <div className="how-grid"><div><span>01</span><h3>Tell us what you own</h3><p>Pick your device, brand, model, and the component that needs replacing.</p></div><div><span>02</span><h3>Let the web agent research</h3><p>TinyFish searches public web sources and can inspect relevant product pages for evidence.</p></div><div><span>03</span><h3>Choose with confidence</h3><p>Compare listings by price and evidence, then verify details with the seller before purchase.</p></div></div>
        </section>
      </main>
      <footer><a className="brandmark" href="#"><span className="brand-icon">↻</span><span>reloop<span className="brand-dot">.</span></span></a><p>Repair first. Replace smarter. <span>Built for a more circular tech economy.</span></p><span className="footer-status"><span className="live-dot"></span> TinyFish integration</span></footer>
    </div>
  );
}

export default App;
