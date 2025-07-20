# Ruby on Rails MCP Server Examples

## Getting Started

```bash
# Navigate to your Rails project
cd /path/to/your/rails/project

# Start the MCP client with Rails server
node /path/to/mcp-client/build/index.js node /path/to/mcp-client/build/servers/rails-mcp-server.js .
```

## Example Commands

### Model Generation

```
> Generate a Post model with title and content
> Create User model with email, password, and admin boolean
> Generate Product model with name, price decimal, and category reference
> Create Comment model belonging to Post and User
```

### Controller Generation

```
> Generate Posts controller with index, show, new, and create actions
> Create API controller for products
> Generate Admin namespace controller
```

### Scaffolding

```
> Scaffold a complete Blog resource with title and content
> Generate Product scaffold with all RESTful actions
> Create Customer scaffold with name, email, and address
```

### Database Operations

```
> Run database migrations
> Show all users in the database
> Find posts where published is true
> Count total number of products
> Show orders from the last 30 days
```

### Rails Commands

```
> Start the Rails server
> Show all routes
> Run the Rails console
> Execute database seeds
> Run all tests
```

## Advanced Examples

### Complex Model Generation
```
> Generate Article model with title, body text, author reference, and published boolean with database index
```

### Database Queries
```
> Find all posts by user with email john@example.com
> Show products where price is between 10 and 100
> List users who have created posts in the last week
```

### User Management
```
> Create admin user with email admin@example.com and custom attributes
> Generate 10 test users with Faker data
```

### Deployment Tasks
```
> Precompile assets for production
> Run migrations on production database
> Clear Rails cache
```