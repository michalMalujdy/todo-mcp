import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TransportService } from "./transportation.service";
import { McpServerService } from "./mcp-server.service";
import { McpController } from "./mcp.controller";
import { ResourcesService } from "./capabilities/resources/resources.service";
import { MCP_RESOURCE, McpResource } from "./capabilities/resources/mcp-resource.interface";
import { MCP_RESOURCE_TEMPLATE, McpResourceTemplate } from "./capabilities/resources/mcp-resource-template.interface";
import { GetAllTasksResource } from "./capabilities/resources/get-all-tasks.resource";
import { GetTasksByStatusResource } from "./capabilities/resources/get-tasks-by-status.resource";

@Module({
    imports: [HttpModule],
    controllers: [McpController],
    providers: [
        McpServerService,
        TransportService,
        ResourcesService,
        GetAllTasksResource,
        GetTasksByStatusResource,
        {
            provide: MCP_RESOURCE,
            useFactory: (
                getAllTasksResource: GetAllTasksResource,
            ): McpResource[] => {
                return [
                    getAllTasksResource
                ];
            },
            inject: [
                GetAllTasksResource,
            ],
        },
        {
            provide: MCP_RESOURCE_TEMPLATE,
            useFactory: (
                getTasksByStatusResource: GetTasksByStatusResource,
            ): McpResourceTemplate[] => {
                return [
                    getTasksByStatusResource
                ];
            },
            inject: [
                GetTasksByStatusResource,
            ]
        }
    ]
})
export class McpModule { }