const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "public",
  "data",
  "Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta_with_manual.geojson"
);

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateManualReadingsForYear(year) {
  const obj = {};
  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${year}-12-31T00:00:00Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = formatDate(d);
    // random integer 0..20
    obj[key] = Math.floor(Math.random() * 21);
  }
  return obj;
}

try {
  const raw = fs.readFileSync(filePath, "utf8");
  const geo = JSON.parse(raw);
  if (!geo.features || !Array.isArray(geo.features)) {
    console.error("No features array found in geojson.");
    process.exit(1);
  }

  const manualYear = 2020; // matches the existing Reading keys (2020)

  geo.features.forEach((f, idx) => {
    if (!f.properties) f.properties = {};
    // Overwrite or create reading_manual
    f.properties.reading_manual = generateManualReadingsForYear(manualYear);
  });

  fs.writeFileSync(filePath, JSON.stringify(geo, null, 2), "utf8");
  console.log(
    `Updated ${filePath} — added reading_manual for ${geo.features.length} features.`
  );
  console.log(
    "Sample of first feature reading_manual keys:",
    Object.keys(geo.features[0].properties.reading_manual).slice(0, 3),
    "... total",
    Object.keys(geo.features[0].properties.reading_manual).length
  );
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
