# Laravel MCP Server Examples

## Getting Started

```bash
# Navigate to your Laravel project
cd /path/to/your/laravel/project

# Start the MCP client with Laravel server
node /path/to/mcp-client/build/index.js node /path/to/mcp-client/build/servers/laravel-mcp-server.js .
```

## Example Commands

### User Management

```
> Create a user named John Doe with email john@example.com
> Create an admin user with email admin@site.com and password SecurePass123
> List all users in the database
```

### Database Operations

```
> Show me the posts table
> Count how many orders we have
> Find users where role is admin
> List products where price is greater than 100
```

### Artisan Commands

```
> Run the migrations
> Clear all caches
> Show me the route list
> Run database seeders
> Create a new migration for products table
```

## Advanced Examples

### Complex User Creation
```
> Create 5 test users with sequential emails like test1@example.com, test2@example.com
```

### Database Queries
```
> Show me users who registered in the last 7 days
> Find orders with status pending and total greater than 1000
```

### Maintenance Tasks
```
> Put the application in maintenance mode
> Clear all caches and optimize the application
> Run tests and show me the results
```