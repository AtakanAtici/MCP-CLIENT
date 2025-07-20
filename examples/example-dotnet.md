# .NET MCP Server Examples

## Getting Started

```bash
# Navigate to your .NET project
cd /path/to/your/dotnet/project

# Start the MCP client with .NET server
node /path/to/mcp-client/build/index.js node /path/to/mcp-client/build/servers/dotnet-mcp-server.js .
```

## Example Commands

### Controller Management

```
> Create a Products controller
> Generate an API controller named Categories with CRUD actions
> Create Admin controller with custom actions Login and Dashboard
```

### Entity Framework

```
> Create a Product entity with name, price, and description
> Generate a Customer model with address and phone properties
> Create Order entity with relationship to Customer
```

### Package Management

```
> Add Entity Framework Core to the project
> Install Serilog for logging
> Add AutoMapper version 12.0.0
> Install Swagger for API documentation
```

### .NET CLI Operations

```
> Build the project
> Run all tests
> Clean the solution
> Publish the application for production
```

### Scaffolding

```
> Scaffold CRUD operations for Product model
> Generate controller and views for Customer entity
> Create API endpoints for Order management
```

## Advanced Examples

### Complex Entity Creation
```
> Create a Blog entity with Title, Content, Author relationship, and Tags collection
```

### Build and Deploy
```
> Build the project in Release mode and run tests
> Publish the application with runtime included for Linux
```

### Database Migrations
```
> Generate a migration for the new Product entity
> Update the database with pending migrations
```