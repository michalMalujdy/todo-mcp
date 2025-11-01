# MCP Implementation Guide

This guide will walk you through implementing the Model Context Protocol (MCP) server for the Todo application.

## 📖 Table of Contents

1. [Understanding MCP](#understanding-mcp)
2. [Setup MCP Server Project](#setup-mcp-server-project)
3. [Core Implementation](#core-implementation)
4. [Tool Implementations](#tool-implementations)
5. [Resource Implementations](#resource-implementations)
6. [Prompt Implementations](#prompt-implementations)
7. [Testing](#testing)
8. [Client Configuration](#client-configuration)

---

## Understanding MCP

### What is MCP?

Model Context Protocol (MCP) is a standardized protocol for connecting LLMs to external data sources and tools. It consists of three main components:

1. **Tools**: Functions the LLM can call (like API endpoints)
2. **Resources**: Read-only data the LLM can access (like databases)
3. **Prompts**: Reusable prompt templates for common workflows

### MCP Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   LLM       │◄───────►│ MCP Server  │◄───────►│  Backend    │
│ (Claude)    │  MCP    │             │  HTTP   │  REST API   │
└─────────────┘         └─────────────┘         └─────────────┘
```

The MCP server acts as a bridge, translating:
- LLM requests → API calls
- API responses → LLM-friendly formats

---

## Setup MCP Server Project

### 1. Create Project Structure

```bash
mkdir mcp-server
cd mcp-server
npm init -y
```

### 2. Install Dependencies

```bash
# Core MCP SDK
npm install @modelcontextprotocol/sdk

# HTTP client for API calls
npm install axios

# Schema validation
npm install zod

# Development dependencies
npm install -D typescript @types/node tsx

# TypeScript config
npx tsc --init
```

### 3. Update `package.json`

```json
{
  "name": "todo-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  }
}
```

### 4. Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Core Implementation

### 1. Create API Client (`src/api-client.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';

export class TodoApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  // Task CRUD operations
  async createTask(data: any) {
    const response = await this.client.post('/tasks', data);
    return response.data;
  }

  async getTasks(params?: any) {
    const response = await this.client.get('/tasks', { params });
    return response.data;
  }

  async getTask(id: string) {
    const response = await this.client.get(`/tasks/${id}`);
    return response.data;
  }

  async updateTask(id: string, data: any) {
    const response = await this.client.patch(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string) {
    await this.client.delete(`/tasks/${id}`);
  }

  async searchTasks(query: string) {
    const response = await this.client.get('/tasks/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getStatistics() {
    const response = await this.client.get('/tasks/statistics');
    return response.data;
  }

  async bulkUpdate(data: any) {
    const response = await this.client.patch('/tasks/bulk', data);
    return response.data;
  }
}
```

### 2. Create Main MCP Server (`src/index.ts`)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TodoApiClient } from './api-client.js';
import { registerTools } from './tools.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';

// Initialize API client
const apiClient = new TodoApiClient(process.env.API_URL || 'http://localhost:3000');

// Create MCP server
const server = new Server(
  {
    name: 'todo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Register handlers
registerTools(server, apiClient);
registerResources(server, apiClient);
registerPrompts(server, apiClient);

// Error handling
server.onerror = (error) => {
  console.error('[MCP Error]', error);
};

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Todo MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
```

---

## Tool Implementations

Create `src/tools.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TodoApiClient } from './api-client.js';

export function registerTools(server: Server, apiClient: TodoApiClient) {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'create_task',
        description: 'Create a new todo task with title, description, priority, tags, and due date',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title (required)',
            },
            description: {
              type: 'string',
              description: 'Detailed task description',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority level',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tags for categorization',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in ISO 8601 format',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'list_tasks',
        description: 'List all tasks with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'completed'],
              description: 'Filter by task status',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Filter by priority',
            },
            tags: {
              type: 'string',
              description: 'Filter by tags (comma-separated)',
            },
            search: {
              type: 'string',
              description: 'Search in title and description',
            },
            overdue: {
              type: 'boolean',
              description: 'Show only overdue tasks',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination',
            },
            limit: {
              type: 'number',
              description: 'Number of items per page',
            },
          },
        },
      },
      {
        name: 'get_task',
        description: 'Get details of a specific task by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task UUID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_task',
        description: 'Update an existing task',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task UUID',
            },
            title: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'completed'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            markCompleted: {
              type: 'boolean',
              description: 'Mark task as completed',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_task',
        description: 'Delete a task by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task UUID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'search_tasks',
        description: 'Search tasks by text query in title and description',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_statistics',
        description: 'Get task statistics including counts by status, priority, and completion metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'bulk_update_tasks',
        description: 'Update multiple tasks at once',
        inputSchema: {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of task UUIDs',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'completed'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
            },
            addTags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags to add to all tasks',
            },
          },
          required: ['ids'],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'create_task':
          const task = await apiClient.createTask(args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(task, null, 2),
              },
            ],
          };

        case 'list_tasks':
          const tasks = await apiClient.getTasks(args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(tasks, null, 2),
              },
            ],
          };

        case 'get_task':
          const singleTask = await apiClient.getTask(args.id);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(singleTask, null, 2),
              },
            ],
          };

        case 'update_task':
          const { id, ...updateData } = args;
          const updatedTask = await apiClient.updateTask(id, updateData);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(updatedTask, null, 2),
              },
            ],
          };

        case 'delete_task':
          await apiClient.deleteTask(args.id);
          return {
            content: [
              {
                type: 'text',
                text: `Task ${args.id} deleted successfully`,
              },
            ],
          };

        case 'search_tasks':
          const searchResults = await apiClient.searchTasks(args.query);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(searchResults, null, 2),
              },
            ],
          };

        case 'get_statistics':
          const stats = await apiClient.getStatistics();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };

        case 'bulk_update_tasks':
          const bulkResult = await apiClient.bulkUpdate(args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(bulkResult, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: `API Error: ${error.response?.data?.message || error.message}`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  });
}
```

---

## Resource Implementations

Create `src/resources.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TodoApiClient } from './api-client.js';

export function registerResources(server: Server, apiClient: TodoApiClient) {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'tasks://all',
        name: 'All Tasks',
        description: 'Complete list of all tasks',
        mimeType: 'application/json',
      },
      {
        uri: 'tasks://pending',
        name: 'Pending Tasks',
        description: 'All tasks that are not completed (todo + in_progress)',
        mimeType: 'application/json',
      },
      {
        uri: 'tasks://completed',
        name: 'Completed Tasks',
        description: 'All completed tasks',
        mimeType: 'application/json',
      },
      {
        uri: 'tasks://overdue',
        name: 'Overdue Tasks',
        description: 'Tasks past their due date',
        mimeType: 'application/json',
      },
      {
        uri: 'tasks://statistics',
        name: 'Task Statistics',
        description: 'Analytics and metrics about tasks',
        mimeType: 'application/json',
      },
    ],
  }));

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      let data: any;

      switch (uri) {
        case 'tasks://all':
          data = await apiClient.getTasks();
          break;

        case 'tasks://pending':
          const pending = await apiClient.getTasks({
            status: 'todo',
          });
          const inProgress = await apiClient.getTasks({
            status: 'in_progress',
          });
          data = {
            todo: pending.data,
            in_progress: inProgress.data,
            total: pending.total + inProgress.total,
          };
          break;

        case 'tasks://completed':
          data = await apiClient.getTasks({ status: 'completed' });
          break;

        case 'tasks://overdue':
          data = await apiClient.getTasks({ overdue: true });
          break;

        case 'tasks://statistics':
          data = await apiClient.getStatistics();
          break;

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read resource ${uri}: ${error.message}`);
    }
  });
}
```

---

## Prompt Implementations

Create `src/prompts.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TodoApiClient } from './api-client.js';

export function registerPrompts(server: Server, apiClient: TodoApiClient) {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: 'daily-review',
        description: 'Generate a daily task review with productivity insights',
        arguments: [
          {
            name: 'focus_area',
            description: 'Optional focus area to emphasize (e.g., "work", "personal")',
            required: false,
          },
        ],
      },
      {
        name: 'create-task-guided',
        description: 'Interactive guided task creation with best practices',
        arguments: [
          {
            name: 'task_type',
            description: 'Type of task: work, personal, urgent, routine',
            required: false,
          },
        ],
      },
    ],
  }));

  // Get prompt content
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'daily-review': {
          const stats = await apiClient.getStatistics();
          const pending = await apiClient.getTasks({ status: 'todo', limit: 100 });
          const overdue = await apiClient.getTasks({ overdue: true, limit: 100 });

          const focusArea = args?.focus_area || 'general';

          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please review my tasks for today with a focus on ${focusArea} tasks.

Current Statistics:
${JSON.stringify(stats, null, 2)}

Pending Tasks:
${JSON.stringify(pending.data, null, 2)}

Overdue Tasks:
${JSON.stringify(overdue.data, null, 2)}

Please provide:
1. A summary of my current task status
2. Recommendations for priorities
3. Suggestions for managing overdue tasks
4. Productivity insights`,
                },
              },
            ],
          };
        }

        case 'create-task-guided': {
          const taskType = args?.task_type || 'general';

          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `I want to create a new ${taskType} task. Please guide me through the process by asking about:
1. Task title (clear and actionable)
2. Detailed description
3. Priority level (considering urgency and importance)
4. Relevant tags for organization
5. Due date (if applicable)

Best practices for ${taskType} tasks:
- Be specific and actionable in the title
- Break down complex tasks into smaller subtasks
- Set realistic deadlines
- Use tags for easy filtering and organization
- Set appropriate priority based on impact and urgency

Let's start with the task title. What would you like to accomplish?`,
                },
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    } catch (error) {
      throw new Error(`Failed to get prompt ${name}: ${error.message}`);
    }
  });
}
```

---

## Testing

### 1. Test with MCP Inspector

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run your MCP server through the inspector
npx @modelcontextprotocol/inspector tsx src/index.ts
```

This opens a web UI where you can:
- Test all tools
- View all resources
- Try prompts
- Debug responses

### 2. Manual Testing Script

Create `test-mcp.ts`:

```typescript
import { TodoApiClient } from './src/api-client.js';

async function test() {
  const client = new TodoApiClient();

  console.log('Testing API client...\n');

  // Test 1: Create task
  console.log('1. Creating task...');
  const task = await client.createTask({
    title: 'Test MCP Integration',
    priority: 'high',
    tags: ['mcp', 'testing'],
  });
  console.log('Created:', task);

  // Test 2: List tasks
  console.log('\n2. Listing tasks...');
  const tasks = await client.getTasks();
  console.log(`Found ${tasks.total} tasks`);

  // Test 3: Get statistics
  console.log('\n3. Getting statistics...');
  const stats = await client.getStatistics();
  console.log('Stats:', stats);

  console.log('\n✅ All tests passed!');
}

test().catch(console.error);
```

Run with: `tsx test-mcp.ts`

---

## Client Configuration

### Cursor Configuration

Add to `.cursor/config.json` or `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Verify Configuration

1. Restart Cursor/Claude Desktop
2. Look for MCP server in the tools list
3. Try a simple command: "List all my tasks"
4. The LLM should use your MCP tools to fetch and display tasks

---

## Next Steps

1. **Error Handling**: Add comprehensive error handling
2. **Logging**: Implement structured logging for debugging
3. **Caching**: Cache frequently accessed data
4. **Authentication**: Add API key support if needed
5. **Rate Limiting**: Prevent API abuse
6. **Monitoring**: Track tool usage and performance
7. **Documentation**: Document each tool's behavior
8. **Testing**: Add unit and integration tests

## Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

Happy MCP building! 🚀


