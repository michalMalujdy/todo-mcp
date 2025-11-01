import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update-task.dto';
import { Task } from './entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks.',
  })
  findAll(@Query() filterDto: FilterTaskDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return task statistics.',
  })
  getStatistics() {
    return this.tasksService.getStatistics();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tasks by text in title or description' })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return matching tasks.',
  })
  search(@Query('q') query: string) {
    return this.tasksService.searchTasks(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the task.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple tasks at once' })
  @ApiResponse({
    status: 200,
    description: 'The tasks have been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'No tasks found.' })
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateTaskDto) {
    return this.tasksService.bulkUpdate(bulkUpdateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 204,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}


