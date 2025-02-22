console.log('Hello, World!')

Bun.serve({
  fetch: (request) => {
    return new Response('Hello, World!')
  },
  port: process.env.PORT ?? 3030,
})
