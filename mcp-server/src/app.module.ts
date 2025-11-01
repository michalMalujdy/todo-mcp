import { Module } from '@nestjs/common';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [McpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

