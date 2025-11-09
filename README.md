# Todo MCP

An educational project to explore capabilities of the Model Context Protocol (MCP).

## Description

This project serves as a learning exercise to understand and experiment with the Model Context Protocol (MCP). It demonstrates how to build an MCP server that bridges LLMs with a RESTful API, enabling natural language interactions with a Todo management system.

The project consists of:
- **Backend**: NestJS REST API for Todo management
- **MCP Server**: MCP server that exposes backend functionality to LLMs
- **MCP Inspector**: Tool for testing and debugging MCP servers

## Prerequisites

- Node.js 18+ and npm
- Basic understanding of TypeScript and REST APIs

## Installation

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install MCP server dependencies:
   ```bash
   cd ../mcp-server
   npm install
   ```

3. (Optional) Seed the database with sample data:
   ```bash
   cd ../backend
   npm run seed
   ```

## Run It

To start all services (backend, MCP server, and inspector), use the provided start script:

```bash
./start.sh
```

This script will:
1. Start the backend API on `http://localhost:3000`
2. Start the MCP server on `http://localhost:3001`
3. Launch the MCP Inspector

### MCP Inspector Configuration

When the inspector opens, configure it with the following settings:

- **Transport Type**: Streamable HTTP
- **URL**: `http://localhost:3001/mcp`
- **Connection Type**: via proxy

After configuration, you can test MCP tools, resources, and prompts through the inspector's web interface.

## Project Structure

```
todo-mcp/
├── backend/          # NestJS REST API
├── mcp-server/       # MCP Server implementation
├── data/             # SQLite database
└── start.sh          # Start script for all services
```

## Stopping Services

Press `Ctrl+C` in the terminal where the start script is running to stop all services.

## License

MIT
