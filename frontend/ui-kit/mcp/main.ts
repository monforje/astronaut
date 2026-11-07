/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server";

const server = createServer();
await server.connect(new StdioServerTransport());
process.stderr.write("astronaut-ui-kit MCP: stdio, готов\n");
