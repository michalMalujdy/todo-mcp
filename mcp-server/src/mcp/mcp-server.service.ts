import { Injectable } from "@nestjs/common";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TransportService } from "./transportation.service";
import { IncomingMessage, ServerResponse } from 'http';
import { ResourcesService } from "./capabilities/resources/resources.service";

@Injectable()
export class McpServerService {
    private readonly server: McpServer;

    constructor(
        private readonly transportService: TransportService,
        private readonly resourcesService: ResourcesService
    ) {
        this.server = new McpServer({
            name: 'Todo',
            version: '1.0.0',
        }, {
            capabilities: {
                resources: {}
            }
        })
        
        resourcesService.register(this.server);
    }

    async handleRequest(
        req: IncomingMessage,
        res: ServerResponse,
        parsedBody?: unknown,
        sessionId?: string
    ) {
        let transport = this.transportService.get(sessionId || '');

        if (transport == null) {
            transport = this.transportService.create();
            await this.server.connect(transport);
        }

        await transport.handleRequest(req, res, parsedBody);
    }
}