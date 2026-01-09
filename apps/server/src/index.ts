// Load environment variables FIRST before any other imports
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Now import everything else
import { createApp } from "./core/app";
import { createContainer } from "./core/container";
import { handleError } from "./core/http";
import { registerRoutes } from "./core/router";

const app = createApp();
const container = createContainer();

registerRoutes(app, container);

app.onError((err, c) => {
  return handleError(err, c);
});

export default app;
