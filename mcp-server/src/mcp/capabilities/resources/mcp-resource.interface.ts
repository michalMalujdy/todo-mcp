export const MCP_RESOURCE = Symbol('MCP_RESOURCE');

export type McpResourceMetadata = {
    name: string,
    description: string,
    uri: string
}

export interface McpResource {
    getMetadata(): McpResourceMetadata;
    handle(uri: URL): Promise<any>;
}