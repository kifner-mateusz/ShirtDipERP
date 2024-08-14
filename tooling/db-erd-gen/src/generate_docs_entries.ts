import * as fs from "fs";
import * as path from "path";

function processDbml(dbmlContent: string) {
  const tableRegex = /table\s+(\w+)\s+\{([\s\S]*?)\}/g;
  const relationRegex = /ref:\s+(\w+)\.(\w+)\s*>\s*(\w+)\.(\w+)/g;
  const relations: { [key: string]: string } = {};

  // Extract relations from the DBML content
  let relationMatch: RegExpExecArray | null;
  // @ts-ignore
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((relationMatch = relationRegex.exec(dbmlContent)) !== null) {
    const table1 = relationMatch[1];
    const column1 = relationMatch[2];
    const table2 = relationMatch[3];
    const column2 = relationMatch[4];
    relations[`${table1}.${column1}`] = `Related to ${table2}.${column2}`;
  }

  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = tableRegex.exec(dbmlContent)) !== null) {
    const tableName = match[1];
    const elementsBlock = match[2];
    const title = tableName;
    if (tableName?.includes("_to_")) continue;
    const outputDir = "../../docs/src/content/docs/schema";
    const outputFilePath = path.join(outputDir, `${tableName}.md`);
    const lastModified = new Date().toISOString();

    let mdContent = `---
title: ${title}
---


![Schema Image](/img/schema/${tableName}.svg)

`;
    if (elementsBlock === undefined) continue;

    const lines = elementsBlock.split("\n");
    for (const line of lines) {
      const line_split = line.trim().split(" ");
      const elementName = line_split[0];
      if (elementName === "") continue;
      if (elementName === "indexes") break;

      const elementType = line_split[1];
      const relation =
        relations[`${tableName}.${elementName}`] ||
        "TODO: add description here";
      mdContent += `### ${elementName} ${elementType}\n${relation}\n\n`;
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, mdContent, "utf8");
  }

  console.log("Markdown files created.");
}

const dbmlFilePath = "./schema.dbml";
const dbmlContent = fs.readFileSync(dbmlFilePath, "utf8");

processDbml(dbmlContent);
