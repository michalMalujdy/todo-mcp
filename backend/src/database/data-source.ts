import { DataSource } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: '../data/todo.db',
  entities: [Task],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true, // Auto-sync schema in development (disable in production)
  logging: false,
});



