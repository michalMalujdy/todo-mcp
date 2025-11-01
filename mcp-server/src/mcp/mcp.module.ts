import { Module } from "@nestjs/common";
import { TransportService } from "./transportation.service";
import { McpServerService } from "./mcp-server.service";
import { McpController } from "./mcp.controller";

@Module({
    imports: [],
    controllers: [McpController],
    providers: [TransportService, McpServerService]
})
export class McpModule { }