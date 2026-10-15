export function demoResults(input) {
  const sample = [
    { title: `${input.brand} ${input.model} ${input.component} — compatible replacement listing`, source: "Example Parts Store", price: 2499, partNumber: null, compatibility: "Unverified", snippet: "Illustrative sample result. No live seller or stock verification has been performed.", url: "https://example.com/parts", compatibilityEvidence: "Demo data only; verify the exact part number with the manufacturer." },
    { title: `OEM / FRU ${input.component} search for ${input.model}`, source: "Manufacturer support search", price: 3899, partNumber: null, compatibility: "Unverified", snippet: "Use the manufacturer's parts lookup to confirm the exact part number for your model.", url: "https://www.google.com/search?q=" + encodeURIComponent(`${input.brand} ${input.model} official parts ${input.component}`), compatibilityEvidence: "This is a search link, not a verified component listing." },
    { title: `Budget ${input.component} option for ${input.brand} devices`, source: "Example Marketplace", price: 1499, partNumber: null, compatibility: "Unverified", snippet: "Illustrative low-price option. Similar device names do not prove compatibility.", url: "https://example.org/replacement-parts", compatibilityEvidence: "Demo data only; check connector, dimensions, voltage, and part number." }
  ];
  return sample.map((item, index) => ({
    ...item,
    currency: ({ IN: "INR", US: "USD", GB: "GBP", CA: "CAD" })[input.country] || "INR",
    tags: index === 0 ? ["Best Overall"] : index === 1 ? ["Premium"] : ["Cheapest", "Best Value"],
    symbol: /battery/i.test(input.component) ? "▰" : /screen|display/i.test(input.component) ? "▣" : "◈"
  }));
}
