import * as fs from "fs";
import * as path from "path";
import { createSVGWindow } from "svgdom";
import { type List, SVG, type Text, registerWindow } from "@svgdotjs/svg.js";

function processSvg(svgContent: string, svgFilename: string) {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  const draw = SVG(document).svg(svgContent);
  let texts: string[] = [];

  // Extract all text elements, trim them, and store them in the texts array
  for (const textElement of draw.find("text") as List<Text>) {
    const textContent = textElement.text().trim();
    if (textContent) {
      texts.push(textContent);
    }
  }

  const new_texts: string[] = [""];

  let second = true;
  for (const text of texts) {
    if (text === "(!)") {
      new_texts[new_texts.length - 1] += ` ${text}`;
      second = false;
    } else if (second) {
      new_texts[new_texts.length - 1] += ` ${text}`;
      second = false;
    } else {
      new_texts.push(text);
      second = true;
    }
  }

  texts = new_texts;

  // Prepare the title and header from the filename
  const title = path.basename(svgFilename, path.extname(svgFilename));
  const svgEmbedded = draw.svg(); // Get the embedded SVG content
  const lastModified = new Date().toISOString(); // Get current date and time

  // Create the markdown content
  let mdContent = `---
title: ${title}
---

![${title} erd schema](/img/schema/${title}.svg)


`;
  let i = 0;
  for (const text of texts) {
    if (i === 0) {
      // mdContent += `# ${text}\n\n`;
      i++;
      continue;
    }
    mdContent += `### ${text}\nTODO: add description here\n\n`;
  }

  mdContent += `\n_Last generated: ${lastModified}_\n`;

  // Define the output file path
  const outputDir = "../../docs/src/content/docs/schema";

  const outputFilePath = path.join(outputDir, `${title}.md`);

  // Ensure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the markdown content to the file
  fs.writeFileSync(outputFilePath, mdContent, "utf8");

  console.log(`Markdown file created at: ${outputFilePath}`);
}

// Example usage
const svgPath = "../../docs/public/img/schema"; // Replace with your SVG file path

for (const file of fs.readdirSync(svgPath)) {
  const filepath = path.join(svgPath, file);
  if (!fs.statSync(filepath).isFile()) continue;
  const svgContent = fs.readFileSync(filepath, "utf8");
  processSvg(svgContent, path.basename(filepath));
}
