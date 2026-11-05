const fs = require("fs");
const path = require("path");

const outputFile = "project_dump.txt";
const outDir = "previews";
let finalText = "";

function traverseDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // 1. Skip folders we don't care about, and the output file itself
    if (
      file === "node_modules" ||
      file === ".git" ||
      file === outputFile ||
      file === ".env"
    )
      return;

    if (stat.isDirectory()) {
      // If it's a folder, go inside it
      traverseDir(filePath);
    } else {
      // 2. Only grab text-based web files (ignores images, binaries, etc.)
      if (/\.(js|ts|jsx|tsx|html|css|json|md|txt)$/.test(file)) {
        const content = fs.readFileSync(filePath, "utf8");

        // 3. Add nice headers so the AI knows which file is which
        finalText += `\n\n========================================\n`;
        finalText += `FILE: ${filePath}\n`;
        finalText += `========================================\n\n`;
        finalText += content;
      }
    }
  });
}

try {
  console.log("Scanning your project...");
  traverseDir("./"); // Start scanning the current folder

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, outputFile), finalText, "utf8");
  console.log(`✅ Success! All your code has been combined into ${outDir}/${outputFile}`);
  console.log("You can now upload this file to our chat.");
} catch (err) {
  console.error("Oops, something went wrong:", err);
}
