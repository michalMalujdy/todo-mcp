import { Module } from "@nestjs/common";
import { TransportService } from "./transportation.service";
import { McpServerService } from "./mcp-server.service";
import { McpController } from "./mcp.controller";
import { ResourcesService } from "./capabilities/resources/resources.service";
import { MCP_RESOURCE, McpResource } from "./capabilities/resources/mcp-resource.interface";
import { GetAllTasksResource } from "./capabilities/resources/get-all-tasks.resource";

@Module({
    imports: [],
    controllers: [McpController],
    providers: [
        McpServerService,
        TransportService,
        ResourcesService,
        GetAllTasksResource,
        {
            provide: MCP_RESOURCE,
            useFactory: (getAllTasksResource: GetAllTasksResource): McpResource[] => {
                return [getAllTasksResource];
            },
            inject: [GetAllTasksResource],
        }
    ]
})
export class McpModule { }