import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '../data/todo.db',
      entities: [Task],
      synchronize: true, // Auto-create tables (disable in production)
      logging: false,
    }),
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


