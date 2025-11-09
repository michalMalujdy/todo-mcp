import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class BulkUpdateTaskDto {
  @ApiProperty({
    description: 'Array of task IDs to update',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiPropertyOptional({
    description: 'Status to apply to all tasks',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Priority to apply to all tasks',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Tags to add to all tasks',
    example: ['reviewed', 'approved'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addTags?: string[];
}



