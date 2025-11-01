# Todo Backend API

NestJS-based REST API for the Todo MCP application.

## Quick Start

```bash
# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start development server
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

## API Endpoints

All endpoints are documented in Swagger at http://localhost:3000/api

### Core Operations

- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks (with pagination and filters)
- `GET /tasks/:id` - Get a single task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Advanced Operations

- `GET /tasks/search?q=query` - Full-text search
- `GET /tasks/statistics` - Get task analytics
- `PATCH /tasks/bulk` - Bulk update multiple tasks

### Filter Parameters

When calling `GET /tasks`, you can use these query parameters:

- `status` - Filter by status (todo, in_progress, completed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `tags` - Filter by tags (comma-separated: "work,urgent")
- `search` - Search in title and description
- `overdue` - Show only overdue tasks (true)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Example:
```
GET /tasks?status=todo&priority=high&tags=work&page=1&limit=20
```

## Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=3000
DATABASE_PATH=../data/todo.db
NODE_ENV=development
```

## Development Scripts

```bash
# Development
npm run start:dev      # Start with hot-reload
npm run start:debug    # Start with debugger

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Lint code
npm run format         # Format code with Prettier

# Database
npm run seed           # Seed database with sample data
```

## Project Structure

```
backend/src/
├── tasks/
│   ├── entities/
│   │   └── task.entity.ts        # Task database entity
│   ├── dto/
│   │   ├── create-task.dto.ts    # Validation for creating tasks
│   │   ├── update-task.dto.ts    # Validation for updating tasks
│   │   ├── filter-task.dto.ts    # Validation for filtering
│   │   └── bulk-update-task.dto.ts
│   ├── tasks.service.ts          # Business logic
│   ├── tasks.controller.ts       # HTTP endpoints
│   └── tasks.module.ts           # Module definition
├── database/
│   ├── data-source.ts            # TypeORM configuration
│   └── seed.ts                   # Database seeding script
├── app.module.ts                 # Root application module
└── main.ts                       # Application entry point
```

## Task Entity Schema

```typescript
Task {
  id: string (UUID)
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## API Response Examples

### Create Task

Request:
```json
POST /tasks
{
  "title": "Implement MCP server",
  "description": "Create MCP server with tools and resources",
  "priority": "high",
  "tags": ["mcp", "backend"],
  "dueDate": "2025-11-01T12:00:00Z"
}
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implement MCP server",
  "description": "Create MCP server with tools and resources",
  "status": "todo",
  "priority": "high",
  "tags": ["mcp", "backend"],
  "dueDate": "2025-11-01T12:00:00.000Z",
  "completedAt": null,
  "createdAt": "2025-10-29T10:00:00.000Z",
  "updatedAt": "2025-10-29T10:00:00.000Z"
}
```

### Get Statistics

Response:
```json
{
  "total": 50,
  "byStatus": {
    "todo": 20,
    "in_progress": 15,
    "completed": 15
  },
  "byPriority": {
    "low": 10,
    "medium": 25,
    "high": 12,
    "urgent": 3
  },
  "overdue": 5,
  "completedToday": 3,
  "completedThisWeek": 8
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error Response Format:
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

## Testing

### Manual Testing with curl

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"high"}'

# Get all tasks
curl http://localhost:3000/tasks

# Get statistics
curl http://localhost:3000/tasks/statistics

# Search tasks
curl http://localhost:3000/tasks/search?q=test

# Update a task
curl -X PATCH http://localhost:3000/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/{id}
```

## Production Considerations

Before deploying to production:

1. **Disable `synchronize: true`** in TypeORM config
2. **Setup proper migrations** using TypeORM CLI
3. **Add authentication** (JWT, OAuth, etc.)
4. **Restrict CORS** to specific origins
5. **Use environment variables** for sensitive data
6. **Switch to PostgreSQL** for better performance
7. **Add rate limiting** to prevent abuse
8. **Enable HTTPS** for secure communication
9. **Add logging** (Winston, Pino, etc.)
10. **Setup monitoring** (Sentry, DataDog, etc.)

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Delete the database and reseed
rm ../data/todo.db
npm run seed
```

### Port Already in Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run start:dev
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
1. Check the Swagger docs at `/api`
2. Review the main README.md
3. Check TypeORM and NestJS documentation


