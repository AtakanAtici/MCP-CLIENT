#!/usr/bin/env node
import { BaseMCPServer } from "./base-mcp-server.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

const CreateControllerSchema = z.object({
  name: z.string().describe("Controller name (without 'Controller' suffix)"),
  actions: z.array(z.string()).optional().describe("List of action methods to generate"),
});

const RunDotnetSchema = z.object({
  command: z.string().describe(".NET CLI command to run (e.g., 'build', 'test', 'run')"),
  args: z.string().optional().describe("Additional arguments"),
});

const AddPackageSchema = z.object({
  package: z.string().describe("NuGet package name"),
  version: z.string().optional().describe("Package version (optional)"),
});

const CreateEntitySchema = z.object({
  name: z.string().describe("Entity class name"),
  properties: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
  })).describe("Entity properties"),
});

export class DotNetMCPServer extends BaseMCPServer {
  constructor(projectPath: string) {
    super("dotnet-mcp-server", "1.0.0", projectPath);
  }

  protected initializeTools() {
    this.registerTool({
      name: "create_controller",
      description: "Create a new ASP.NET Core controller",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Controller name" },
          actions: { 
            type: "array", 
            items: { type: "string" },
            description: "Action methods to generate" 
          },
        },
        required: ["name"],
      },
      handler: async (args) => {
        const validated = CreateControllerSchema.parse(args);
        const controllerName = validated.name.endsWith("Controller") 
          ? validated.name 
          : `${validated.name}Controller`;
        
        const actions = validated.actions || ["Index", "Details", "Create", "Edit", "Delete"];
        const actionsCode = actions.map(action => `
    [HttpGet]
    public IActionResult ${action}()
    {
        return View();
    }`).join("\n");

        const controllerContent = `using Microsoft.AspNetCore.Mvc;

namespace YourApp.Controllers
{
    public class ${controllerName} : Controller
    {${actionsCode}
    }
}`;

        const controllersPath = path.join(this.projectPath, "Controllers");
        await fs.mkdir(controllersPath, { recursive: true });
        
        const filePath = path.join(controllersPath, `${controllerName}.cs`);
        await fs.writeFile(filePath, controllerContent);

        return `Controller created successfully at: Controllers/${controllerName}.cs\nActions: ${actions.join(", ")}`;
      },
    });

    this.registerTool({
      name: "run_dotnet",
      description: "Run .NET CLI commands",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "dotnet command (build, test, run, etc.)" },
          args: { type: "string", description: "Additional arguments" },
        },
        required: ["command"],
      },
      handler: async (args) => {
        const validated = RunDotnetSchema.parse(args);
        const fullCommand = validated.args 
          ? `dotnet ${validated.command} ${validated.args}`
          : `dotnet ${validated.command}`;
        
        const { stdout, stderr } = await execAsync(fullCommand, { cwd: this.projectPath });
        if (stderr && !stdout) throw new Error(stderr);
        return stdout || stderr;
      },
    });

    this.registerTool({
      name: "add_package",
      description: "Add a NuGet package to the project",
      inputSchema: {
        type: "object",
        properties: {
          package: { type: "string", description: "Package name" },
          version: { type: "string", description: "Package version" },
        },
        required: ["package"],
      },
      handler: async (args) => {
        const validated = AddPackageSchema.parse(args);
        const versionArg = validated.version ? ` --version ${validated.version}` : "";
        
        const { stdout, stderr } = await execAsync(
          `dotnet add package ${validated.package}${versionArg}`,
          { cwd: this.projectPath }
        );
        
        if (stderr && !stdout) throw new Error(stderr);
        return `Package '${validated.package}' added successfully!\n${stdout}`;
      },
    });

    this.registerTool({
      name: "create_entity",
      description: "Create a new Entity Framework Core entity class",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Entity name" },
          properties: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                required: { type: "boolean" },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["name", "properties"],
      },
      handler: async (args) => {
        const validated = CreateEntitySchema.parse(args);
        
        const properties = validated.properties.map(prop => {
          const nullable = prop.required === false ? "?" : "";
          return `    public ${prop.type}${nullable} ${prop.name} { get; set; }`;
        }).join("\n");

        const entityContent = `using System;
using System.ComponentModel.DataAnnotations;

namespace YourApp.Models
{
    public class ${validated.name}
    {
        public int Id { get; set; }
${properties}
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}`;

        const modelsPath = path.join(this.projectPath, "Models");
        await fs.mkdir(modelsPath, { recursive: true });
        
        const filePath = path.join(modelsPath, `${validated.name}.cs`);
        await fs.writeFile(filePath, entityContent);

        return `Entity '${validated.name}' created successfully at: Models/${validated.name}.cs`;
      },
    });

    this.registerTool({
      name: "scaffold_crud",
      description: "Scaffold CRUD operations for an entity",
      inputSchema: {
        type: "object",
        properties: {
          model: { type: "string", description: "Model class name" },
          controller: { type: "string", description: "Controller name" },
          dbContext: { type: "string", description: "DbContext class name" },
        },
        required: ["model"],
      },
      handler: async (args) => {
        const model = args.model;
        const controller = args.controller || `${model}Controller`;
        const dbContext = args.dbContext || "ApplicationDbContext";

        const command = `dotnet aspnet-codegenerator controller -name ${controller} -m ${model} -dc ${dbContext} --relativeFolderPath Controllers --useDefaultLayout --referenceScriptLibraries`;
        
        try {
          const { stdout, stderr } = await execAsync(command, { cwd: this.projectPath });
          if (stderr && !stdout) throw new Error(stderr);
          return `CRUD operations scaffolded successfully for ${model}!\n${stdout}`;
        } catch (error: any) {
          return `Note: Make sure you have installed the scaffolding tools:\ndotnet tool install -g dotnet-aspnet-codegenerator\ndotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design\n\nError: ${error.message}`;
        }
      },
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || process.cwd();
  const server = new DotNetMCPServer(projectPath);
  server.run().catch(console.error);
}