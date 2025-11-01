import { AppDataSource } from './data-source';
import { Task, TaskStatus, TaskPriority } from '../tasks/entities/task.entity';

async function seed() {
  console.log('🌱 Seeding database...');

  await AppDataSource.initialize();

  const taskRepository = AppDataSource.getRepository(Task);

  // Clear existing data
  await taskRepository.clear();

  // Create sample tasks
  const tasks = [
    {
      title: 'Setup MCP server',
      description: 'Initialize the Model Context Protocol server with TypeScript SDK',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      tags: ['mcp', 'development', 'backend'],
      dueDate: new Date('2025-11-01'),
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with examples and response formats',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      tags: ['documentation', 'api'],
      dueDate: new Date('2025-11-05'),
    },
    {
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication for secure API access',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      tags: ['security', 'authentication', 'backend'],
      dueDate: new Date('2025-11-10'),
    },
    {
      title: 'Add task filtering',
      description: 'Implement advanced filtering by status, priority, tags, and date ranges',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      tags: ['features', 'backend'],
      completedAt: new Date('2025-10-25'),
    },
    {
      title: 'Create database migrations',
      description: 'Setup TypeORM migrations for production deployments',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      tags: ['database', 'devops'],
      dueDate: new Date('2025-11-15'),
    },
    {
      title: 'Test MCP integration',
      description: 'Test the MCP server with Cursor and Claude Desktop clients',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      tags: ['mcp', 'testing'],
      dueDate: new Date('2025-10-30'),
    },
    {
      title: 'Add task statistics endpoint',
      description: 'Create endpoint to return task completion rates and metrics',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.LOW,
      tags: ['analytics', 'backend'],
      completedAt: new Date('2025-10-28'),
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      tags: ['devops', 'automation'],
      dueDate: new Date('2025-11-20'),
    },
  ];

  await taskRepository.save(tasks);

  console.log(`✅ Seeded ${tasks.length} tasks successfully!`);
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});


