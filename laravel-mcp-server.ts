#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListToolsResultSchema,
  CallToolResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CreateUserSchema = z.object({
  name: z.string().describe("Kullanıcı adı"),
  email: z.string().email().describe("E-posta adresi"),
  password: z.string().optional().describe("Şifre (opsiyonel, boş bırakılırsa otomatik oluşturulur)"),
});

const RunArtisanSchema = z.object({
  command: z.string().describe("Çalıştırılacak Artisan komutu"),
});

const QueryDatabaseSchema = z.object({
  table: z.string().describe("Tablo adı"),
  operation: z.enum(["list", "find", "count"]).describe("İşlem tipi"),
  conditions: z.record(z.any()).optional().describe("Arama koşulları"),
});

class LaravelMCPServer {
  private server: Server;
  private laravelPath: string;

  constructor(laravelPath: string) {
    this.laravelPath = laravelPath;
    this.server = new Server(
      {
        name: "laravel-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "create_user",
          description: "Laravel'de yeni bir kullanıcı oluşturur",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Kullanıcı adı" },
              email: { type: "string", description: "E-posta adresi" },
              password: { type: "string", description: "Şifre (opsiyonel, boş bırakılırsa otomatik oluşturulur)" },
            },
            required: ["name", "email"],
          },
        },
        {
          name: "run_artisan",
          description: "Laravel Artisan komutlarını çalıştırır",
          inputSchema: {
            type: "object",
            properties: {
              command: { type: "string", description: "Çalıştırılacak Artisan komutu" },
            },
            required: ["command"],
          },
        },
        {
          name: "query_database",
          description: "Laravel veritabanını sorgular",
          inputSchema: {
            type: "object",
            properties: {
              table: { type: "string", description: "Tablo adı" },
              operation: { type: "string", enum: ["list", "find", "count"], description: "İşlem tipi" },
              conditions: { type: "object", description: "Arama koşulları" },
            },
            required: ["table", "operation"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "create_user":
          return await this.createUser(args);
        case "run_artisan":
          return await this.runArtisan(args);
        case "query_database":
          return await this.queryDatabase(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async createUser(args: any) {
    const validated = CreateUserSchema.parse(args);
    const password = validated.password || "password123";

    try {
      // Laravel Tinker kullanarak kullanıcı oluştur
      const command = `cd ${this.laravelPath} && php artisan tinker --execute="
        \\$user = new \\\\App\\\\Models\\\\User();
        \\$user->name = '${validated.name}';
        \\$user->email = '${validated.email}';
        \\$user->password = bcrypt('${password}');
        \\$user->save();
        echo 'User created with ID: ' . \\$user->id;
      "`;

      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        throw new Error(stderr);
      }

      return {
        content: [
          {
            type: "text",
            text: `Kullanıcı başarıyla oluşturuldu!\nAd: ${validated.name}\nE-posta: ${validated.email}\nŞifre: ${password}\n${stdout}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Hata: ${error.message}`,
          },
        ],
      };
    }
  }

  private async runArtisan(args: any) {
    const validated = RunArtisanSchema.parse(args);

    try {
      const { stdout, stderr } = await execAsync(
        `cd ${this.laravelPath} && php artisan ${validated.command}`
      );

      if (stderr) {
        throw new Error(stderr);
      }

      return {
        content: [
          {
            type: "text",
            text: stdout,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Hata: ${error.message}`,
          },
        ],
      };
    }
  }

  private async queryDatabase(args: any) {
    const validated = QueryDatabaseSchema.parse(args);

    try {
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

      const tinkerCommand = `cd ${this.laravelPath} && php artisan tinker --execute="echo ${command};"`;
      const { stdout, stderr } = await execAsync(tinkerCommand);

      if (stderr) {
        throw new Error(stderr);
      }

      return {
        content: [
          {
            type: "text",
            text: stdout,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Hata: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Laravel MCP Server started");
  }
}

// Laravel projesinin yolunu komut satırından al
const laravelPath = process.argv[2] || process.cwd();

const server = new LaravelMCPServer(laravelPath);
server.run().catch(console.error);