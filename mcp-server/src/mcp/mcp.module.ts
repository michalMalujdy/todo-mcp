import { Module } from "@nestjs/common";
import { TransportService } from "./transportation.service";
import { McpServerService } from "./mcp-server.service";
import { McpController } from "./mcp.controller";
import { ResourcesService } from "./capabilities/resources/resources.service";

@Module({
    imports: [],
    controllers: [McpController],
    providers: [
        McpServerService,
        TransportService,
        ResourcesService
    ]
})
export class McpModule { }