#!/usr/bin/env node
import { BaseMCPServer } from "./base-mcp-server.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const GenerateModelSchema = z.object({
  name: z.string().describe("Model name"),
  attributes: z.array(z.object({
    name: z.string(),
    type: z.enum(["string", "text", "integer", "float", "decimal", "datetime", "boolean", "references"]),
  })).optional().describe("Model attributes"),
});

const RunRailsSchema = z.object({
  command: z.string().describe("Rails command to run"),
  args: z.string().optional().describe("Additional arguments"),
});

const GenerateControllerSchema = z.object({
  name: z.string().describe("Controller name"),
  actions: z.array(z.string()).optional().describe("Controller actions"),
});

const CreateUserSchema = z.object({
  email: z.string().email().describe("User email"),
  password: z.string().optional().describe("User password"),
  attributes: z.record(z.any()).optional().describe("Additional user attributes"),
});

export class RailsMCPServer extends BaseMCPServer {
  constructor(projectPath: string) {
    super("rails-mcp-server", "1.0.0", projectPath);
  }

  protected initializeTools() {
    this.registerTool({
      name: "generate_model",
      description: "Generate a Rails model with migrations",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Model name" },
          attributes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { 
                  type: "string", 
                  enum: ["string", "text", "integer", "float", "decimal", "datetime", "boolean", "references"] 
                },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["name"],
      },
      handler: async (args) => {
        const validated = GenerateModelSchema.parse(args);
        
        let command = `rails generate model ${validated.name}`;
        if (validated.attributes) {
          const attrs = validated.attributes.map(attr => `${attr.name}:${attr.type}`).join(" ");
          command += ` ${attrs}`;
        }

        const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);

        // Run migration
        await execAsync("rails db:migrate", { cwd: this.projectPath });

        return `Model '${validated.name}' generated and migrated successfully!\n${stdout}`;
      },
    });

    this.registerTool({
      name: "run_rails",
      description: "Run Rails commands",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Rails command" },
          args: { type: "string", description: "Additional arguments" },
        },
        required: ["command"],
      },
      handler: async (args) => {
        const validated = RunRailsSchema.parse(args);
        const fullCommand = validated.args 
          ? `rails ${validated.command} ${validated.args}`
          : `rails ${validated.command}`;

        const { stdout, stderr } = await execAsync(fullCommand, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);
        return stdout || stderr;
      },
    });

    this.registerTool({
      name: "generate_controller",
      description: "Generate a Rails controller",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Controller name" },
          actions: {
            type: "array",
            items: { type: "string" },
            description: "Controller actions",
          },
        },
        required: ["name"],
      },
      handler: async (args) => {
        const validated = GenerateControllerSchema.parse(args);
        
        let command = `rails generate controller ${validated.name}`;
        if (validated.actions) {
          command += ` ${validated.actions.join(" ")}`;
        }

        const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);

        return `Controller '${validated.name}' generated successfully!\n${stdout}`;
      },
    });

    this.registerTool({
      name: "create_user",
      description: "Create a user in Rails console",
      inputSchema: {
        type: "object",
        properties: {
          email: { type: "string", description: "User email" },
          password: { type: "string", description: "User password" },
          attributes: { type: "object", description: "Additional attributes" },
        },
        required: ["email"],
      },
      handler: async (args) => {
        const validated = CreateUserSchema.parse(args);
        const password = validated.password || "password123";
        
        let userAttrs = `email: '${validated.email}', password: '${password}'`;
        if (validated.attributes) {
          const extraAttrs = Object.entries(validated.attributes)
            .map(([key, value]) => `${key}: '${value}'`)
            .join(", ");
          userAttrs += `, ${extraAttrs}`;
        }

        const command = `rails runner "user = User.create!(${userAttrs}); puts 'User created with ID: ' + user.id.to_s"`;
        
        const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);

        return `User created successfully!\nEmail: ${validated.email}\nPassword: ${password}\n${stdout}`;
      },
    });

    this.registerTool({
      name: "scaffold",
      description: "Generate a complete Rails scaffold",
      inputSchema: {
        type: "object",
        properties: {
          resource: { type: "string", description: "Resource name" },
          attributes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["resource"],
      },
      handler: async (args) => {
        const resource = args.resource;
        let command = `rails generate scaffold ${resource}`;
        
        if (args.attributes) {
          const attrs = args.attributes.map((attr: any) => `${attr.name}:${attr.type}`).join(" ");
          command += ` ${attrs}`;
        }

        const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);

        // Run migration
        await execAsync("rails db:migrate", { cwd: this.projectPath });

        return `Scaffold for '${resource}' generated and migrated successfully!\n${stdout}`;
      },
    });

    this.registerTool({
      name: "db_console",
      description: "Execute database queries via Rails",
      inputSchema: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model name" },
          method: { type: "string", description: "Query method (all, first, last, count, where)" },
          conditions: { type: "object", description: "Query conditions" },
        },
        required: ["model", "method"],
      },
      handler: async (args) => {
        let query = `${args.model}.${args.method}`;
        
        if (args.method === "where" && args.conditions) {
          const whereClause = Object.entries(args.conditions)
            .map(([key, value]) => `${key}: '${value}'`)
            .join(", ");
          query += `(${whereClause})`;
        }

        const command = `rails runner "puts ${query}.to_json"`;
        
        const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);

        return stdout;
      },
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || process.cwd();
  const server = new RailsMCPServer(projectPath);
  server.run().catch(console.error);
}