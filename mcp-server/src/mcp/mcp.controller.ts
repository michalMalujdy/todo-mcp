import { Controller, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from 'express';
import { McpServerService } from "./mcp-server.service";

@Controller('mcp')
export class McpController {
    constructor(
        private readonly mcpServerService: McpServerService
    ) {}

    @Post()
    async handle(@Req() req: Request, @Res() res: Response) {
        const sessionId = req.headers['mcp-session-id'] as string;

        console.debug('Request under POST /mcp', sessionId);
        
        await this.mcpServerService.handleRequest(req, res, req.body, sessionId);
    }
}