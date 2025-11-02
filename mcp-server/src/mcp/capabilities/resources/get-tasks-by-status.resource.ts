import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import { McpResourceTemplate, McpResourceTemplateMetadata } from "./mcp-resource-template.interface";

export class GetTasksByStatusResource implements McpResourceTemplate {
    constructor(
        private readonly http: HttpService
    ) { }

    getMetadata(): McpResourceTemplateMetadata {
        return {
            name: "Get list of tasks filtered by the 'status' argument",
            description: 'Get tasks filtered by status. REQUIRED PARAMETER: status (query param). Valid values: "todo", "in_progress", "completed". Example URI: tasks://status?status=todo',
            uriTemplate: "tasks://status/{status}"
        }
    }
    async handle(uri: URL, variables: Variables): Promise<any> {
        const status = variables['status'];
        console.log('status', status);

        const response = await firstValueFrom(
            this.http.get(`http://localhost:3000/tasks?status=${status}&page=1&limit=100`)
        );

        return response.data;
    }
}