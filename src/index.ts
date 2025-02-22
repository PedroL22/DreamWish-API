import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

app.get("/hello", (c) => {
	return c.json({ hello: "Hello World!" });
});

Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT ?? 3030,
});
