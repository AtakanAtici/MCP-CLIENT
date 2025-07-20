# MCP Client Framework 🚀

A universal Model Context Protocol (MCP) client that enables natural language interaction with various development frameworks through Claude AI.

## 🌟 Features

- **Natural Language Commands**: Interact with your applications using plain English
- **Multi-Framework Support**: Built-in servers for Laravel, .NET, and Ruby on Rails
- **MCP Protocol**: Leverages the Model Context Protocol for seamless AI-tool communication
- **Interactive CLI**: Real-time command-line interface for continuous interaction
- **Extensible Architecture**: Easy to add support for new frameworks
- **Framework-Specific Tools**: Tailored tools for each framework's unique features

## 📋 Prerequisites

- Node.js 16+ 
- PHP 8.0+
- Your framework project (Laravel, .NET, Rails, etc.)
- Anthropic API key

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mcpclient-demo
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment:**
```bash
cp .env.example .env
```

4. **Add your Anthropic API key to `.env`:**
```env
ANTHROPIC_API_KEY=your-api-key-here
```

5. **Build the project:**
```bash
npm run build
```

## 🚀 Usage

### Basic MCP Client

Connect to any MCP server:

```bash
node build/index.js <mcp-server-command> [args...]
```

Example with filesystem server:
```bash
node build/index.js npx @modelcontextprotocol/server-filesystem /tmp
```

### Framework-Specific Servers

#### Laravel
```bash
node build/index.js node build/servers/laravel-mcp-server.js /path/to/your/laravel/project
```

#### .NET / ASP.NET Core
```bash
node build/index.js node build/servers/dotnet-mcp-server.js /path/to/your/dotnet/project
```

#### Ruby on Rails
```bash
node build/index.js node build/servers/rails-mcp-server.js /path/to/your/rails/project
```

## 🎯 Available Tools by Framework

### Laravel Tools

### 1. User Management (`create_user`)
Create new users with natural language:
- "Create a user named John"
- "Add a user with email admin@example.com"
- "Create user Alice with password secret123"

### 2. Artisan Commands (`run_artisan`)
Execute any Artisan command:
- "Run migrate command"
- "Show route:list"
- "Clear the cache"
- "Run db:seed"

### 3. Database Queries (`query_database`)
Query your database naturally:
- "List all users"
- "Show users table"
- "Count posts in database"
- "Find users where role is admin"

### .NET Tools

#### 1. Controller Management (`create_controller`)
Create ASP.NET Core controllers:
- "Create a Products controller"
- "Add a controller named Admin with custom actions"
- "Generate UserController with CRUD actions"

#### 2. .NET CLI Commands (`run_dotnet`)
Execute any .NET CLI command:
- "Build the project"
- "Run tests"
- "Start the application"
- "Clean the solution"

#### 3. NuGet Package Management (`add_package`)
Manage project dependencies:
- "Add Entity Framework Core"
- "Install Newtonsoft.Json version 13.0.1"
- "Add Serilog for logging"

#### 4. Entity Creation (`create_entity`)
Create Entity Framework Core models:
- "Create a Product entity with name and price"
- "Generate User model with email and password"
- "Add Customer entity with address properties"

#### 5. CRUD Scaffolding (`scaffold_crud`)
Generate complete CRUD operations:
- "Scaffold CRUD for Product model"
- "Generate controller and views for Customer"

### Ruby on Rails Tools

#### 1. Model Generation (`generate_model`)
Create Rails models with migrations:
- "Generate a Post model with title and content"
- "Create User model with email and admin boolean"
- "Add Product with name, price, and category reference"

#### 2. Rails Commands (`run_rails`)
Execute Rails commands:
- "Run database migrations"
- "Start the Rails server"
- "Show routes"
- "Run console"

#### 3. Controller Generation (`generate_controller`)
Create Rails controllers:
- "Generate Posts controller with index and show"
- "Create Admin controller"
- "Add API controller for products"

#### 4. User Management (`create_user`)
Create users via Rails console:
- "Create admin user with email admin@example.com"
- "Add user John with custom attributes"

#### 5. Scaffolding (`scaffold`)
Generate complete resources:
- "Scaffold a Blog with title and content"
- "Create Product resource with all attributes"

#### 6. Database Console (`db_console`)
Query database through Rails:
- "Show all users"
- "Find posts where published is true"
- "Count total products"

## 💡 Example Session

```bash
$ node build/index.js node build/laravel-mcp-server.js ~/my-laravel-app

Connecting to MCP server...
Connected to MCP server. Found 3 tools.

Available tools:
- create_user: Creates a new user in Laravel
- run_artisan: Runs Laravel Artisan commands
- query_database: Queries Laravel database

MCP Client ready! Type your messages (or 'quit' to exit):

> Create a user named Atakan with email atakan@example.com
Claude's response:
I'll create a user named Atakan for you.

Using tool: create_user
Tool result: {
  "content": [{
    "type": "text",
    "text": "User successfully created!\nName: Atakan\nEmail: atakan@example.com\nPassword: password123\nUser created with ID: 1"
  }]
}

> List all users in the database
Claude's response:
I'll retrieve all users from the database for you.

Using tool: query_database
Tool result: {
  "content": [{
    "type": "text", 
    "text": "[{\"id\":1,\"name\":\"Atakan\",\"email\":\"atakan@example.com\",\"created_at\":\"2024-01-20 10:30:00\"}]"
  }]
}

> quit
Disconnected from MCP server.
```

## 🏗️ Architecture

```
mcpclient-demo/
├── MCPClient.ts              # Core MCP client implementation
├── index.ts                  # CLI interface
├── servers/                  # Framework-specific MCP servers
│   ├── base-mcp-server.ts    # Base class for all MCP servers
│   ├── laravel-mcp-server.ts # Laravel server implementation
│   ├── dotnet-mcp-server.ts  # .NET server implementation
│   └── rails-mcp-server.ts   # Rails server implementation
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Development

### Build Commands

```bash
# Build entire project
npm run build

# Build Laravel server only
npm run build-server
```

### Creating Your Own Framework Server

To add support for a new framework:

1. Create a new file in `servers/` directory
2. Extend the `BaseMCPServer` class
3. Implement the `initializeTools()` method
4. Register your framework-specific tools

Example structure:
```typescript
import { BaseMCPServer } from "./base-mcp-server.js";

export class MyFrameworkMCPServer extends BaseMCPServer {
  constructor(projectPath: string) {
    super("myframework-mcp-server", "1.0.0", projectPath);
  }

  protected initializeTools() {
    this.registerTool({
      name: "my_tool",
      description: "Description of what this tool does",
      inputSchema: { /* JSON Schema */ },
      handler: async (args) => {
        // Tool implementation
        return "Result";
      },
    });
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Anthropic's MCP SDK](https://github.com/anthropics/model-context-protocol)
- Powered by Claude AI
- Support for multiple development frameworks
- Extensible architecture for adding new frameworks