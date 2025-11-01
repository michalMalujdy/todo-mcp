# Quick Start Guide

Get your Todo MCP application running in under 5 minutes!

## ⚡ Quick Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This creates sample tasks you can immediately interact with.

### 3. Start the Backend

```bash
npm run start:dev
```

The API will be running at:
- 🚀 API: http://localhost:3000
- 📚 Swagger Docs: http://localhost:3000/api

### 4. Test the API

Open http://localhost:3000/api in your browser and try the interactive API documentation.

Or use curl:

```bash
# Get all tasks
curl http://localhost:3000/tasks

# Get statistics
curl http://localhost:3000/tasks/statistics

# Create a new task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"high"}'
```

## 🎯 Next Steps

### Implement Your MCP Server

Now that the backend is running, you can implement the MCP server following the comprehensive guide in `MCP_IMPLEMENTATION_GUIDE.md`.

Key steps:
1. Create `mcp-server` directory
2. Install MCP SDK and dependencies
3. Implement tools, resources, and prompts
4. Test with MCP Inspector
5. Configure Cursor/Claude Desktop

### What You'll Build

Your MCP server will expose these capabilities to LLMs:

**Tools (8 functions):**
- `create_task` - Create new tasks
- `list_tasks` - List with filters
- `get_task` - Get single task
- `update_task` - Update task
- `delete_task` - Delete task
- `search_tasks` - Full-text search
- `get_statistics` - Get analytics
- `bulk_update_tasks` - Bulk operations

**Resources (5 URIs):**
- `tasks://all` - All tasks
- `tasks://pending` - Pending tasks
- `tasks://completed` - Completed tasks
- `tasks://overdue` - Overdue tasks
- `tasks://statistics` - Task stats

**Prompts (2 templates):**
- `daily-review` - Daily productivity review
- `create-task-guided` - Guided task creation

## 📚 Documentation

- `README.md` - Main project overview
- `backend/README.md` - Backend API documentation
- `MCP_IMPLEMENTATION_GUIDE.md` - Step-by-step MCP implementation

## 🔍 Verify Everything Works

1. ✅ Backend running on http://localhost:3000
2. ✅ Swagger docs accessible at http://localhost:3000/api
3. ✅ Sample data loaded (8 tasks)
4. ✅ API endpoints responding correctly

Try this in Swagger:
1. Open http://localhost:3000/api
2. Try `GET /tasks/statistics` - Should show counts
3. Try `POST /tasks` - Create your first task
4. Try `GET /tasks` - See all tasks

## 🚨 Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run start:dev
```

### Database errors
```bash
# Delete and recreate database
rm ../data/todo.db
npm run seed
```

### Module not found
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🎓 Learning Path

1. ✅ **Phase 1 (Done)**: Backend API running
2. 🔨 **Phase 2 (Next)**: Implement MCP server
3. 🧪 **Phase 3**: Test with MCP Inspector
4. 🎯 **Phase 4**: Use with Cursor/Claude
5. 🚀 **Phase 5**: Extend with your own features

## 💡 Example API Usage

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn MCP",
    "description": "Understand Model Context Protocol",
    "priority": "high",
    "tags": ["learning", "mcp"],
    "dueDate": "2025-11-01T12:00:00Z"
  }'

# List pending tasks
curl http://localhost:3000/tasks?status=todo&status=in_progress

# Search tasks
curl http://localhost:3000/tasks/search?q=MCP

# Get task statistics
curl http://localhost:3000/tasks/statistics

# Update a task (use ID from previous response)
curl -X PATCH http://localhost:3000/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "markCompleted": true}'
```

## 🎉 Success!

Your backend is now ready! Head over to `MCP_IMPLEMENTATION_GUIDE.md` to implement the MCP server and connect it to your LLM.

Happy coding! 🚀


