import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ResourcesService {
    register(server: McpServer) {
        server.registerResource(
            'all-tasks',
            'tasks://all',
            {
                title: 'Get All Tasks',
                description: 'Complete, unfiltered list of all tasks',
                mimeType: 'application/json'
            },
            async (uri) => {
                const tasks = [
                    { id: '1', title: 'Task 1', status: 'todo' },
                    { id: '2', title: 'Task 2', status: 'completed' }
                ];

                return {
                    contents: [
                        {
                            uri: uri.href,
                            mimeType: 'application/json',
                            text: JSON.stringify(tasks, null, 2)
                        }
                    ]
                }
            }
        )
    }
}