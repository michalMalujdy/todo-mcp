import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Inject, Injectable } from "@nestjs/common";
import { MCP_RESOURCE, McpResource } from "./mcp-resource.interface";
import { MCP_RESOURCE_TEMPLATE, McpResourceTemplate } from "./mcp-resource-template.interface";

@Injectable()
export class ResourcesService {
    constructor(
        @Inject(MCP_RESOURCE) private readonly resources: McpResource[],
        @Inject(MCP_RESOURCE_TEMPLATE) private readonly resourceTemplates: McpResourceTemplate[],
    ) { }

    register(server: McpServer) {
        this.resources.forEach(resource => {
            this.registerResource(server, resource);
        });

        this.resourceTemplates.forEach(resourceTemplate => {
            this.registerResourceTemplates(server, resourceTemplate);
        })
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
                const result = await resource.handle(uri);

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

    private registerResourceTemplates(
        server: McpServer,
        resourceTemplate: McpResourceTemplate
    ) {
        const metadata = resourceTemplate.getMetadata();
        const uri = new ResourceTemplate(metadata.uriTemplate, { list: null });

        server.registerResource(
            metadata.name,
            uri,
            {
                title: metadata.name,
                description: metadata.description,
                mimeType: 'application/json'
            },
            async (uri, variables) => {
                const result = await resourceTemplate.handle(uri, variables);
                
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