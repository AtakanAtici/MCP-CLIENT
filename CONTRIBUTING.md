# Contributing to MCP Client Framework

We love your input! We want to make contributing to MCP Client Framework as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Adding support for new frameworks

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code follows the existing style.
6. Issue that pull request!

## Adding a New Framework

To add support for a new framework:

1. Create a new file in the `servers/` directory:
   ```
   servers/myframework-mcp-server.ts
   ```

2. Extend the `BaseMCPServer` class:
   ```typescript
   import { BaseMCPServer } from "./base-mcp-server.js";
   
   export class MyFrameworkMCPServer extends BaseMCPServer {
     constructor(projectPath: string) {
       super("myframework-mcp-server", "1.0.0", projectPath);
     }
   
     protected initializeTools() {
       // Register your framework-specific tools here
     }
   }
   ```

3. Add examples in the `examples/` directory:
   ```
   examples/example-myframework.md
   ```

4. Update the README to include your framework.

## Code Style

- Use TypeScript
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Pull Request Process

1. Update the README.md with details of changes, if applicable.
2. Update the examples with any new functionality.
3. The PR will be merged once you have the sign-off of at least one maintainer.

## Any contributions you make will be under the ISC License

When you submit code changes, your submissions are understood to be under the same [ISC License](LICENSE) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/AtakanAtici/MCP-CLIENT/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/AtakanAtici/MCP-CLIENT/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its ISC License.