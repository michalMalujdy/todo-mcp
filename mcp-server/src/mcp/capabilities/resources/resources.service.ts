import { McpServer, ReadResourceCallback, ResourceMetadata } from "@modelcontextprotocol/sdk/server/mcp";
import { Inject, Injectable } from "@nestjs/common";
import { MCP_RESOURCE, McpResource } from "./mcp-resource.interface";

@Injectable()
export class ResourcesService {
    constructor(
        @Inject(MCP_RESOURCE) private readonly resources: McpResource[]
    ) { }

    register(server: McpServer) {
        this.resources.forEach(resource => {
            this.registerResource(server, resource);
        });
    }

    private registerResource(server: McpServer, resource: McpResource) {
        const metadata = resource.getMetadata();
        
        server.registerResource(
            metadata.name,
            metadata.uri,
            {
                title: metadata.name,
                description: metadata.description,
                mimeType: 'application/json'
            },
            async (uri) => {
                const result = resource.handle(uri);

                return {
                    contents: [
                        {
                            uri: uri.href,
                            mimeType: 'application/json',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                }
            }
        )
    }
}