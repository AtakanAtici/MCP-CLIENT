import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListToolsResultSchema,
  CallToolResultSchema
} from "@modelcontextprotocol/sdk/types.js";

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

export abstract class BaseMCPServer {
  protected server: Server;
  protected projectPath: string;
  protected tools: Map<string, Tool> = new Map();

  constructor(name: string, version: string, projectPath: string) {
    this.projectPath = projectPath;
    this.server = new Server(
      { name, version },
      { capabilities: { tools: {} } }
    );

    this.setupBaseHandlers();
  }

  protected abstract initializeTools(): void;

  private setupBaseHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await tool.handler(args);
        return {
          content: [
            {
              type: "text",
              text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  protected registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  async run() {
    this.initializeTools();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`${this.server.name} started on stdio`);
  }
}