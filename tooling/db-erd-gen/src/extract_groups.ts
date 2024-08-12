import * as fs from "fs";
import * as path from "path";
import { createSVGWindow } from "svgdom";
import {
  type List,
  type Polygon,
  type Rect,
  SVG,
  registerWindow,
} from "@svgdotjs/svg.js";

function calculateInscribedRectangleHeight(
  ellipseWidth: number,
  ellipseHeight: number,
  rectWidth: number,
): number {
  const semiMinorAxis = ellipseHeight / 2;

  if (rectWidth > ellipseWidth) {
    throw new Error("Rectangle width cannot be greater than ellipse width");
  }

  const rectHeight =
    2 * semiMinorAxis * Math.sqrt(1 - rectWidth ** 2 / ellipseWidth ** 2);
  return rectHeight;
}

function polygonToRect(polygon: Polygon): Rect {
  // Get the points from the polygon
  const points = polygon.attr("points") || "";
  const pointArray = points
    .split(" ")
    .map((point: string) => point.split(",").map(Number));

  // Calculate bounding box
  if (pointArray.length === 0) {
    throw new Error("Polygon has no points");
  }

  const xCoords = pointArray.map((point: string[]) => point[0]);
  const yCoords = pointArray.map((point: string[]) => point[1]);

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  const width = maxX - minX;
  const height = maxY - minY;
  if (polygon === null || polygon.parent() === null) {
    throw new Error("Polygon has no parent");
  }

  // Create and return a rectangle with the bounding box dimensions
  const rect: Rect = (polygon.parent() as any)
    .rect(width, height)
    .move(minX, minY);
  rect.attr(polygon.attr()); // Copy attributes from the polygon

  return rect;
}

// Function to extract groups from an SVG file
function extractGroups(svgFilePath: string, outputDir: string) {
  // Read the SVG file
  const svgData = fs.readFileSync(svgFilePath, "utf8");
  const svgDataStr = svgData.toString().replace(/<!DOCTYPE[^>]*>/, "");

  // Set up a virtual DOM environment
  const window = createSVGWindow();
  const document = window.document;

  // Register window and document with svg.js
  registerWindow(window, document);

  // Load the SVG data into svg.js
  const draw = SVG(document).svg(svgDataStr);

  // Find all groups in the SVG
  const groups = draw.find("g");

  if (groups.length === 0) {
    console.log("No groups found in the SVG.");
    return;
  }

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Extract each group and save it as a separate SVG file
  groups.each((group, index) => {
    if (
      group.attr("id").startsWith("edge") ||
      group.attr("id").startsWith("graph")
    ) {
      return;
    }

    const width = group.findOne("ellipse")?.attr("rx") * 2;
    const height = group.findOne("ellipse")?.attr("ry") * 2;

    const groupSvg = SVG().size(width, height);

    groupSvg.add(group.clone());
    const polygons = groupSvg.find("polygon") as List<Polygon>;

    polygons.each((polygon) => {
      const rect = polygonToRect(polygon);
      polygon.replace(rect);
    });

    const x_offset = group.findOne("ellipse")?.attr("cx");
    const y_offset = group.findOne("ellipse")?.attr("cy");

    const first_rect = groupSvg.findOne("rect");

    let rect_width = first_rect?.attr("width") || 0;
    const rect_height =
      calculateInscribedRectangleHeight(
        width,
        height,
        first_rect?.attr("width") || 0,
      ) + 4;
    rect_width += 12;

    groupSvg.size(rect_width / 2, rect_height / 2);

    for (const element of groupSvg.find("*")) {
      const x = element.attr("x");
      const y = element.attr("y");

      if (x !== undefined && y !== undefined) {
        // Move the element by the given offsets
        const newX = (Number.parseFloat(x) || 0) - x_offset + rect_width / 2;
        const newY = (Number.parseFloat(y) || 0) - y_offset + rect_height / 2;
        element.attr({ x: newX.toFixed(0), y: newY.toFixed(0) });
      }
    }

    const c_group = groupSvg.findOne("g");

    c_group?.attr("transform", "scale(0.5)");

    // Get the SVG string for the group
    const groupSvgData = groupSvg.svg();

    // Write the group SVG to a new file
    const groupFileName = path.join(outputDir, `${group.attr("id")}.svg`);
    fs.writeFileSync(groupFileName, groupSvgData, "utf8");

    console.log(
      `Group${index + 1} ${group.attr("id")} saved as ${groupFileName}`,
    );
  });
}

const svgFilePath = "../../docs/public/img/schema.svg"; // Replace with your SVG file path
const outputDir = "../../docs/public/img/schema"; // Replace with your desired output directory

extractGroups(svgFilePath, outputDir);
