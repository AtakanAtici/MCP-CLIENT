#!/usr/bin/env node
import dotenv from "dotenv";
import { MCPClient } from "./MCPClient.js";
import readline from "readline";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const client = new MCPClient();
  
  const serverCommand = process.argv[2];
  const serverArgs = process.argv.slice(3);

  if (!serverCommand) {
    console.error("Usage: node index.js <mcp-server-command> [args...]");
    console.error("Example: node index.js npx @modelcontextprotocol/server-filesystem /tmp");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MCP server: ${serverCommand} ${serverArgs.join(" ")}`);
    const tools = await client.connectToServer(serverCommand, serverArgs);
    
    console.log("\nAvailable tools:");
    tools.forEach((tool) => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    console.log("\nMCP Client ready! Type your messages (or 'quit' to exit):\n");

    const processInput = async () => {
      rl.question("> ", async (input) => {
        if (input.toLowerCase() === "quit") {
          await client.disconnect();
          rl.close();
          process.exit(0);
        }

        try {
          const response = await client.sendMessage(input);
          
          console.log("\nClaude's response:");
          
          for (const content of response.content) {
            if (content.type === "text") {
              console.log(content.text);
            } else if (content.type === "tool_use") {
              console.log(`\nUsing tool: ${content.name}`);
              const toolResult = await client.processToolUse(content);
              console.log("Tool result:", JSON.stringify(toolResult, null, 2));
            }
          }
          
          console.log();
        } catch (error) {
          console.error("Error:", error);
        }

        processInput();
      });
    };

    processInput();
  } catch (error) {
    console.error("Failed to connect to MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});