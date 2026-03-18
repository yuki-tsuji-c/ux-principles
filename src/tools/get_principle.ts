import * as fs from "fs";
import * as path from "path";

const PRINCIPLES_DIR = path.join(__dirname, "../../principles");

export async function getPrinciple(args: { principle: string }) {
  const { principle } = args;

  if (principle === "all") {
    const nielsen = fs.readFileSync(
      path.join(PRINCIPLES_DIR, "nielsen-10.md"),
      "utf-8"
    );
    const gestalt = fs.readFileSync(
      path.join(PRINCIPLES_DIR, "gestalt.md"),
      "utf-8"
    );
    const wcag = fs.readFileSync(
      path.join(PRINCIPLES_DIR, "wcag.md"),
      "utf-8"
    );
    return {
      content: [
        {
          type: "text",
          text: `# UX原則 全件\n\n${nielsen}\n\n---\n\n${gestalt}\n\n---\n\n${wcag}`,
        },
      ],
    };
  }

  const fileMap: Record<string, string> = {
    nielsen: "nielsen-10.md",
    gestalt: "gestalt.md",
    wcag: "wcag.md",
  };

  const fileName = fileMap[principle];
  if (!fileName) {
    throw new Error(
      `Unknown principle: ${principle}. Use 'nielsen', 'gestalt', 'wcag', or 'all'.`
    );
  }

  const filePath = path.join(PRINCIPLES_DIR, fileName);
  const content = fs.readFileSync(filePath, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}
