#!/usr/bin/env node
import { BaseMCPServer } from "./base-mcp-server.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CreateUserSchema = z.object({
  name: z.string().describe("User name"),
  email: z.string().email().describe("Email address"),
  password: z.string().optional().describe("Password (optional, auto-generated if empty)"),
});

const RunArtisanSchema = z.object({
  command: z.string().describe("Artisan command to run"),
});

const QueryDatabaseSchema = z.object({
  table: z.string().describe("Table name"),
  operation: z.enum(["list", "find", "count"]).describe("Operation type"),
  conditions: z.record(z.any()).optional().describe("Search conditions"),
});

export class LaravelMCPServer extends BaseMCPServer {
  constructor(projectPath: string) {
    super("laravel-mcp-server", "1.0.0", projectPath);
  }

  protected initializeTools() {
    this.registerTool({
      name: "create_user",
      description: "Create a new user in Laravel",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "User name" },
          email: { type: "string", description: "Email address" },
          password: { type: "string", description: "Password (optional)" },
        },
        required: ["name", "email"],
      },
      handler: async (args) => {
        const validated = CreateUserSchema.parse(args);
        const password = validated.password || "password123";

        const command = `cd ${this.projectPath} && php artisan tinker --execute="
          \\$user = new \\\\App\\\\Models\\\\User();
          \\$user->name = '${validated.name}';
          \\$user->email = '${validated.email}';
          \\$user->password = bcrypt('${password}');
          \\$user->save();
          echo 'User created with ID: ' . \\$user->id;
        "`;

        const { stdout, stderr } = await execAsync(command);
        if (stderr) throw new Error(stderr);

        return `User successfully created!\nName: ${validated.name}\nEmail: ${validated.email}\nPassword: ${password}\n${stdout}`;
      },
    });

    this.registerTool({
      name: "run_artisan",
      description: "Run Laravel Artisan commands",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Artisan command to run" },
        },
        required: ["command"],
      },
      handler: async (args) => {
        const validated = RunArtisanSchema.parse(args);
        const { stdout, stderr } = await execAsync(
          `cd ${this.projectPath} && php artisan ${validated.command}`
        );
        if (stderr) throw new Error(stderr);
        return stdout;
      },
    });

    this.registerTool({
      name: "query_database",
      description: "Query Laravel database",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table name" },
          operation: { type: "string", enum: ["list", "find", "count"], description: "Operation type" },
          conditions: { type: "object", description: "Search conditions" },
        },
        required: ["table", "operation"],
      },
      handler: async (args) => {
        const validated = QueryDatabaseSchema.parse(args);
        let command = "";

        switch (validated.operation) {
          case "list":
            command = `\\\\DB::table('${validated.table}')->get()->toJson()`;
            break;
          case "find":
            const conditions = Object.entries(validated.conditions || {})
              .map(([key, value]) => `where('${key}', '${value}')`)
              .join("->");
            command = `\\\\DB::table('${validated.table}')->${conditions}->get()->toJson()`;
            break;
          case "count":
            command = `\\\\DB::table('${validated.table}')->count()`;
            break;
        }

        const tinkerCommand = `cd ${this.projectPath} && php artisan tinker --execute="echo ${command};"`;
        const { stdout, stderr } = await execAsync(tinkerCommand);
        if (stderr) throw new Error(stderr);
        return stdout;
      },
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || process.cwd();
  const server = new LaravelMCPServer(projectPath);
  server.run().catch(console.error);
}