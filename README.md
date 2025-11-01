# Todo MCP - Model Context Protocol Todo Application

A comprehensive Todo application demonstrating Model Context Protocol (MCP) integration with a NestJS backend and SQLite database.

## 🎯 Project Overview

This project is a Proof of Concept (PoC) showcasing how to integrate MCP with a RESTful API to enable LLM interactions with a Todo management system. The architecture consists of:

- **Backend API**: NestJS-based REST API with full CRUD operations
- **Database**: SQLite for persistent task storage
- **MCP Server**: (To be implemented) Bridge between LLMs and the API
- **MCP Client**: (To be implemented) Configuration for Cursor/Claude Desktop

## 🏗️ Project Structure

```
todo-mcp/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── tasks/           # Task module (entities, DTOs, services, controllers)
│   │   ├── database/        # Database configuration and seed data
│   │   ├── app.module.ts    # Main application module
│   │   └── main.ts          # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── mcp-server/              # MCP Server (to be implemented)
├── data/                    # SQLite database storage
│   └── todo.db
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript knowledge
- Basic understanding of REST APIs and MCP

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Run database seed (optional):**
   ```bash
   npm run seed
   ```
   This creates sample tasks for testing.

3. **Start the development server:**
   ```bash
   npm run start:dev
   ```

4. **Access the API:**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api

## 📚 API Documentation

### Task Entity Structure

```typescript
{
  id: string;              // UUID
  title: string;           // Task title (max 255 chars)
  description?: string;    // Optional detailed description
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];         // Array of tag strings
  dueDate?: Date;          // Optional due date
  completedAt?: Date;      // Auto-set when status becomes 'completed'
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}
```

### Available Endpoints

#### 1. Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "todo",
  "priority": "high",
  "tags": ["documentation", "urgent"],
  "dueDate": "2025-11-01T12:00:00Z"
}
```

#### 2. Get All Tasks (with filters)
```http
GET /tasks?status=todo&priority=high&tags=work&page=1&limit=10
```

Query Parameters:
- `status`: Filter by status (todo, in_progress, completed)
- `priority`: Filter by priority (low, medium, high, urgent)
- `tags`: Filter by tags (comma-separated)
- `search`: Search in title and description
- `overdue`: Show only overdue tasks (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response:
```json
{
  "data": [...tasks],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### 3. Get Single Task
```http
GET /tasks/:id
```

#### 4. Search Tasks
```http
GET /tasks/search?q=documentation
```

#### 5. Get Statistics
```http
GET /tasks/statistics
```

Response:
```json
{
  "total": 100,
  "byStatus": {
    "todo": 40,
    "in_progress": 25,
    "completed": 35
  },
  "byPriority": {
    "low": 20,
    "medium": 50,
    "high": 25,
    "urgent": 5
  },
  "overdue": 8,
  "completedToday": 5,
  "completedThisWeek": 15
}
```

#### 6. Update Task
```http
PATCH /tasks/:id
Content-Type: application/json

{
  "status": "completed",
  "markCompleted": true
}
```

#### 7. Bulk Update Tasks
```http
PATCH /tasks/bulk
Content-Type: application/json

{
  "ids": ["uuid-1", "uuid-2"],
  "status": "completed",
  "priority": "high",
  "addTags": ["reviewed"]
}
```

#### 8. Delete Task
```http
DELETE /tasks/:id
```

## 🔌 MCP Integration Guide

### What You Need to Implement

The MCP server will act as a bridge between LLMs (like Claude in Cursor) and your REST API. Here's what you should implement:

### 1. MCP Server Structure

Create an MCP server in `mcp-server/` with the following components:

#### A. MCP Tools (Function Calls)

These are the primary interaction methods for the LLM:

```typescript
// Example tool definitions to implement
const tools = [
  {
    name: "create_task",
    description: "Create a new todo task",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        tags: { type: "array", items: { type: "string" } },
        dueDate: { type: "string", format: "date-time" }
      },
      required: ["title"]
    }
  },
  {
    name: "list_tasks",
    description: "List all tasks with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        priority: { type: "string" },
        search: { type: "string" },
        overdue: { type: "boolean" }
      }
    }
  },
  {
    name: "update_task",
    description: "Update an existing task",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string" },
        priority: { type: "string" },
        markCompleted: { type: "boolean" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_task",
    description: "Delete a task by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "get_statistics",
    description: "Get task statistics and analytics",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "search_tasks",
    description: "Search tasks by text query",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  },
  {
    name: "bulk_update_tasks",
    description: "Update multiple tasks at once",
    inputSchema: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" } },
        status: { type: "string" },
        priority: { type: "string" }
      },
      required: ["ids"]
    }
  }
];
```

#### B. MCP Resources (Read-Only Data)

Resources provide structured data that LLMs can access:

```typescript
// Example resource definitions to implement
const resources = [
  {
    uri: "tasks://all",
    name: "All Tasks",
    description: "Complete list of all tasks",
    mimeType: "application/json"
  },
  {
    uri: "tasks://pending",
    name: "Pending Tasks",
    description: "All tasks not yet completed",
    mimeType: "application/json"
  },
  {
    uri: "tasks://completed",
    name: "Completed Tasks",
    description: "All completed tasks",
    mimeType: "application/json"
  },
  {
    uri: "tasks://overdue",
    name: "Overdue Tasks",
    description: "Tasks past their due date",
    mimeType: "application/json"
  },
  {
    uri: "tasks://statistics",
    name: "Task Statistics",
    description: "Analytics and metrics about tasks",
    mimeType: "application/json"
  }
];
```

#### C. MCP Prompts (Reusable Templates)

Prompts help guide the LLM in common workflows:

```typescript
// Example prompt definitions to implement
const prompts = [
  {
    name: "daily-review",
    description: "Review today's tasks and productivity",
    arguments: [
      {
        name: "focus_area",
        description: "Optional focus area to emphasize",
        required: false
      }
    ]
  },
  {
    name: "create-task-guided",
    description: "Interactive task creation with best practices",
    arguments: [
      {
        name: "task_type",
        description: "Type of task (work, personal, urgent)",
        required: false
      }
    ]
  }
];
```

### 2. Implementation Steps

1. **Setup MCP Server Project:**
   ```bash
   mkdir mcp-server
   cd mcp-server
   npm init -y
   npm install @modelcontextprotocol/sdk axios zod
   npm install -D typescript @types/node
   ```

2. **Create API Client:**
   - Use axios to make HTTP calls to `http://localhost:3000`
   - Handle authentication if needed
   - Implement error handling and retries

3. **Implement Tool Handlers:**
   - Each tool should map to one or more API endpoints
   - Transform API responses into LLM-friendly formats
   - Add helpful error messages for the LLM

4. **Implement Resource Handlers:**
   - Fetch data from API endpoints
   - Format as structured JSON
   - Consider caching for performance

5. **Setup Server Transport:**
   - Use stdio or SSE transport
   - Handle server lifecycle (startup, shutdown)
   - Implement logging for debugging

### 3. Cursor Configuration

Add to your Cursor settings (`.cursor/config.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### 4. Testing Your MCP Server

Use the MCP Inspector tool:
```bash
npx @modelcontextprotocol/inspector node path/to/mcp-server/dist/index.js
```

This opens a web UI where you can:
- Test tool calls
- Inspect resource URIs
- View prompts
- Debug server responses

## 🎓 Learning Resources

### Key MCP Concepts to Master

1. **Server-Sent Events (SSE)**: Real-time communication pattern
2. **Tool Design**: Creating intuitive, composable functions for LLMs
3. **Schema Validation**: Using Zod for runtime type checking
4. **Error Handling**: Making failures informative for LLMs
5. **Resource URIs**: Designing clean, hierarchical data access patterns
6. **Prompt Engineering**: Creating helpful templates for common tasks

### Recommended Reading

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

## 🧪 Testing

### Backend Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual API Testing

Use the Swagger UI at http://localhost:3000/api or tools like:
- Postman
- Insomnia
- curl
- HTTPie

### MCP Testing

1. Start backend: `npm run start:dev`
2. Start MCP server: `node mcp-server/dist/index.js`
3. Open MCP Inspector
4. Test each tool and resource
5. Try in Cursor chat

## 🔮 Future Enhancements

Ideas to expand your learning:

1. **Authentication**: Add JWT auth to secure the API
2. **Real-time Updates**: WebSocket support for live task changes
3. **Attachments**: File upload support for tasks
4. **Collaboration**: Multi-user support with permissions
5. **Notifications**: Due date reminders and webhooks
6. **Advanced Search**: Full-text search with SQLite FTS
7. **Task Templates**: Reusable task blueprints
8. **Subtasks**: Hierarchical task relationships
9. **Time Tracking**: Log time spent on tasks
10. **Export/Import**: CSV, JSON, and markdown export

## 📝 Notes

- The backend uses `synchronize: true` for development. **Disable this in production** and use migrations instead.
- SQLite is great for local development but consider PostgreSQL for production.
- The API has CORS enabled for all origins - restrict this in production.
- No authentication is implemented - add this before exposing publicly.

## 🤝 Contributing

This is a learning project! Experiment, break things, and learn from the process.

## 📄 License

MIT

---

**Happy Learning!** 🚀

For questions about MCP implementation, refer to the official MCP documentation and examples in the MCP SDK repository.


