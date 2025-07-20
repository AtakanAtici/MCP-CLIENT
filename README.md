# MCP Client Demo 🚀

A powerful Model Context Protocol (MCP) client that enables natural language interaction with Laravel applications through Claude AI.

## 🌟 Features

- **Natural Language Commands**: Interact with your Laravel app using plain English
- **Laravel Integration**: Built-in support for user management, Artisan commands, and database queries
- **MCP Protocol**: Leverages the Model Context Protocol for seamless AI-tool communication
- **Interactive CLI**: Real-time command-line interface for continuous interaction
- **Extensible**: Easy to add new tools and capabilities

## 📋 Prerequisites

- Node.js 16+ 
- PHP 8.0+
- Laravel project
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

### Laravel Integration

Use the custom Laravel MCP server:

```bash
node build/index.js node build/laravel-mcp-server.js /path/to/your/laravel/project
```

## 🎯 Available Laravel Tools

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
├── MCPClient.ts          # Core MCP client implementation
├── index.ts              # CLI interface
├── laravel-mcp-server.ts # Laravel-specific MCP server
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Development

### Build Commands

```bash
# Build entire project
npm run build

# Build Laravel server only
npm run build-server
```

### Adding New Tools

To add new tools to the Laravel MCP server, modify `laravel-mcp-server.ts`:

1. Add tool definition in `setupToolHandlers()`
2. Implement the tool handler method
3. Add appropriate validation with Zod schemas

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Anthropic's MCP SDK](https://github.com/anthropics/model-context-protocol)
- Powered by Claude AI
- Laravel framework integration