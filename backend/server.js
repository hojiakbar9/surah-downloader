// Import the framework and instantiate it
import Fastify from "fastify";
import routes from "./routes.js";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});
fastify.register(cors, {
  origin: true,
});
fastify.register(routes);
// Run the server!
try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
