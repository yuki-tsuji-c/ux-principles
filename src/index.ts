import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getPrinciple } from "./tools/get_principle.js";
import { checkUx } from "./tools/check_ux.js";
import { suggestFix } from "./tools/suggest_fix.js";

const server = new Server(
  {
    name: "ux-principles",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_principle",
        description:
          "UX原則の詳細を取得する。nielsen（ニールセンの10原則）またはgestalt（ゲシュタルト原則）を指定できる。",
        inputSchema: {
          type: "object",
          properties: {
            principle: {
              type: "string",
              enum: ["nielsen", "gestalt", "all"],
              description: "取得する原則: nielsen / gestalt / all",
            },
          },
          required: ["principle"],
        },
      },
      {
        name: "check_ux",
        description:
          "HTML・コンポーネント・ユーザーフロー・画面説明文をUX原則に基づいてチェックし、違反を検出する。",
        inputSchema: {
          type: "object",
          properties: {
            target_type: {
              type: "string",
              enum: ["html", "component", "flow", "description"],
              description:
                "チェック対象の種類: html / component / flow / description",
            },
            content: {
              type: "string",
              description: "チェック対象のコンテンツ（HTML文字列・説明文など）",
            },
            focus: {
              type: "string",
              enum: ["nielsen", "gestalt", "all"],
              description: "重点的にチェックする原則（省略時はall）",
            },
          },
          required: ["target_type", "content"],
        },
      },
      {
        name: "suggest_fix",
        description:
          "UX違反に対する具体的な改善提案を返す。check_uxで検出した違反IDを渡す。",
        inputSchema: {
          type: "object",
          properties: {
            violation_ids: {
              type: "array",
              items: { type: "string" },
              description: "改善提案を取得したい違反ID（例: ['n01', 'g05']）",
            },
            context: {
              type: "string",
              description: "画面・コンポーネントのコンテキスト（省略可）",
            },
          },
          required: ["violation_ids"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_principle":
        return await getPrinciple(args as { principle: string });
      case "check_ux":
        return await checkUx(
          args as {
            target_type: string;
            content: string;
            focus?: string;
          }
        );
      case "suggest_fix":
        return await suggestFix(
          args as {
            violation_ids: string[];
            context?: string;
          }
        );
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("UX Principles MCP Server started");
}

main().catch(console.error);
