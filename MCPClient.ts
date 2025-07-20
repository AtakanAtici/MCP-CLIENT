import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Tool } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Anthropic } from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_BASE_URL =
  process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219";

export class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
      baseURL: ANTHROPIC_BASE_URL,
    });
    this.mcp = new Client({ name: "mcpclient-demo", version: "1.0.0" });
  }

  async connectToServer(command: string, args: string[] = []) {
    this.transport = new StdioClientTransport({
      command,
      args,
    });

    await this.mcp.connect(this.transport);
    
    const response = await this.mcp.listTools();
    this.tools = response.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      input_schema: tool.inputSchema as Tool.InputSchema,
    }));

    console.log(`Connected to MCP server. Found ${this.tools.length} tools.`);
    return this.tools;
  }

  async callTool(toolName: string, args: any = {}) {
    try {
      const result = await this.mcp.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      throw error;
    }
  }

  async sendMessage(message: string) {
    const messages = [
      {
        role: "user" as const,
        content: message,
      },
    ];

    try {
      const response = await this.anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages,
        tools: this.tools,
      });

      return response;
    } catch (error) {
      console.error("Error sending message to Anthropic:", error);
      throw error;
    }
  }

  async processToolUse(toolUse: any) {
    const toolResult = await this.callTool(toolUse.name, toolUse.input);
    return toolResult;
  }

  async disconnect() {
    if (this.transport) {
      await this.mcp.close();
      this.transport = null;
      console.log("Disconnected from MCP server.");
    }
  }

  getTools() {
    return this.tools;
  }
}