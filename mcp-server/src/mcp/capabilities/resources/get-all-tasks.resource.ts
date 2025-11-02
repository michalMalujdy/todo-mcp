import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { McpResource, McpResourceMetadata } from "./mcp-resource.interface";

@Injectable()
export class GetAllTasksResource implements McpResource {
    constructor(
        private readonly http: HttpService
    ) { }

    getMetadata(): McpResourceMetadata {
        return {
            name: 'Get All Tasks',
            description: 'Complete, unfiltered list of all tasks',
            uri: 'tasks://all'
        }
    }
    async handle(uri: URL) {
        const response = await firstValueFrom(
            this.http.get('http://localhost:3000/tasks')
        );

        return response.data;
    }

}