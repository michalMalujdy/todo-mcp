import { Injectable } from "@nestjs/common";
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

@Injectable()
export class TransportService {
    private readonly transports: Map<string, StreamableHTTPServerTransport>;

    constructor() {
        this.transports = new Map<string, StreamableHTTPServerTransport>();
    }

    get(sessionId: string): StreamableHTTPServerTransport | null {
        return this.transports.get(sessionId) || null;
    }

    create(): StreamableHTTPServerTransport {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
                this.transports.set(sessionId, transport);
            },
            onsessionclosed: (sessionId) => {
                this.transports.delete(sessionId);
            },
        });

        return transport;
    }
}