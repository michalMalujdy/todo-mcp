export const MCP_RESOURCE = Symbol('MCP_RESOURCE');

export type McpResourceMetadata = {
    name: string,
    uri: string,
    description: string,
}

export interface McpResource {
    getMetadata(): McpResourceMetadata;
    handle(uri: URL): Promise<any>;
}