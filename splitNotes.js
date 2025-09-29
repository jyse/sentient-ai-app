// splitNotes.js
const fs = require("fs");

// Read the whole file
const input = fs.readFileSync("sentient_notes.txt", "utf8");

// Split by delimiter (e.g., --- on a line by itself)
const chunks = input.split(/^---$/m);

chunks.forEach((chunk, index) => {
  const trimmed = chunk.trim();
  if (trimmed) {
    const filename = `chunk_${index + 1}.txt`;
    fs.writeFileSync(filename, trimmed, "utf8");
    console.log(`✅ Saved ${filename}`);
  }
});
