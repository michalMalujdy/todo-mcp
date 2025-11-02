import { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";

export const MCP_RESOURCE_TEMPLATE = Symbol('MCP_RESOURCE_TEMPLATE');

export type McpResourceTemplateMetadata = {
    name: string,
    description: string,
    uriTemplate: string
}

export interface McpResourceTemplate {
    getMetadata(): McpResourceTemplateMetadata;
    handle(uri: URL, variables: Variables): Promise<any>;
}