import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, LessThan } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update-task.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStatistics {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdue: number;
  completedToday: number;
  completedThisWeek: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });
    return await this.taskRepository.save(task);
  }

  async findAll(filterDto?: FilterTaskDto): Promise<PaginatedResult<Task>> {
    const { page = 1, limit = 10, ...filters } = filterDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('task.status = :status', {
        status: filters.status,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.tags) {
      const tagArray = filters.tags.split(',').map((tag) => tag.trim());
      // Check if any of the tags match
      tagArray.forEach((tag, index) => {
        queryBuilder.andWhere(`task.tags LIKE :tag${index}`, {
          [`tag${index}`]: `%${tag}%`,
        });
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    if (filters.overdue) {
      const now = new Date().toISOString();
      queryBuilder.andWhere('task.dueDate < :now', { now });
      queryBuilder.andWhere('task.status != :completed', {
        completed: TaskStatus.COMPLETED,
      });
    }

    // Order by priority and due date
    queryBuilder.orderBy('task.createdAt', 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Get results
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Handle markCompleted flag
    if (updateTaskDto.markCompleted !== undefined) {
      if (updateTaskDto.markCompleted) {
        task.status = TaskStatus.COMPLETED;
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
      delete updateTaskDto.markCompleted;
    }

    // Handle status change to completed
    if (updateTaskDto.status === TaskStatus.COMPLETED && !task.completedAt) {
      task.completedAt = new Date();
    } else if (
      updateTaskDto.status &&
      updateTaskDto.status !== TaskStatus.COMPLETED
    ) {
      task.completedAt = null;
    }

    Object.assign(task, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
    });

    return await this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateTaskDto): Promise<Task[]> {
    const { ids, status, priority, addTags } = bulkUpdateDto;

    if (ids.length === 0) {
      throw new BadRequestException('No task IDs provided');
    }

    const tasks = await this.taskRepository.find({
      where: { id: In(ids) },
    });

    if (tasks.length === 0) {
      throw new NotFoundException('No tasks found with the provided IDs');
    }

    tasks.forEach((task) => {
      if (status !== undefined) {
        task.status = status;
        if (status === TaskStatus.COMPLETED && !task.completedAt) {
          task.completedAt = new Date();
        } else if (status !== TaskStatus.COMPLETED) {
          task.completedAt = null;
        }
      }

      if (priority !== undefined) {
        task.priority = priority;
      }

      if (addTags && addTags.length > 0) {
        const existingTags = task.tags || [];
        const uniqueTags = Array.from(
          new Set([...existingTags, ...addTags]),
        );
        task.tags = uniqueTags;
      }
    });

    return await this.taskRepository.save(tasks);
  }

  async getStatistics(): Promise<TaskStatistics> {
    const allTasks = await this.taskRepository.find();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const statistics: TaskStatistics = {
      total: allTasks.length,
      byStatus: {
        todo: 0,
        in_progress: 0,
        completed: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
      overdue: 0,
      completedToday: 0,
      completedThisWeek: 0,
    };

    allTasks.forEach((task) => {
      // Count by status
      statistics.byStatus[task.status]++;

      // Count by priority
      statistics.byPriority[task.priority]++;

      // Count overdue
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== TaskStatus.COMPLETED
      ) {
        statistics.overdue++;
      }

      // Count completed today
      if (
        task.completedAt &&
        new Date(task.completedAt) >= todayStart
      ) {
        statistics.completedToday++;
      }

      // Count completed this week
      if (
        task.completedAt &&
        new Date(task.completedAt) >= weekStart
      ) {
        statistics.completedThisWeek++;
      }
    });

    return statistics;
  }

  async searchTasks(query: string): Promise<Task[]> {
    return await this.taskRepository
      .createQueryBuilder('task')
      .where('task.title LIKE :query', { query: `%${query}%` })
      .orWhere('task.description LIKE :query', { query: `%${query}%` })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }
}



