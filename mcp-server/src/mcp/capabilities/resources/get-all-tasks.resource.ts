import { Injectable } from "@nestjs/common";
import { McpResource, McpResourceMetadata } from "./mcp-resource.interface";

@Injectable()
export class GetAllTasksResource implements McpResource {
    getMetadata(): McpResourceMetadata {
        return {
            name: 'Get All Tasks',
            description: 'Complete, unfiltered list of all tasks',
            uri: 'tasks://all'
        }
    }
    handle(uri: URL) {
        const tasks = [
            { id: '1', title: 'Task 1', status: 'todo' },
            { id: '2', title: 'Task 2', status: 'completed' }
        ];

        return tasks;
    }

}