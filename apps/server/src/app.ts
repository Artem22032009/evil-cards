import websocketPlugin from "@fastify/websocket"
import { createClient } from "@evil-cards/keydb"

import memoryLogPlugin from "./plugins/log-memory.ts"
import gracefulShutdown from "./plugins/graceful-shutdown.ts"
import Controller from "./game/controller.ts"
import SessionManager from "./game/session-manager.ts"
import { SessionFactory } from "./game/session.ts"
import gameRoutes from "./routes/game.ts"
import { env } from "./env.ts"
import { getServer } from "@evil-cards/fastify"

const fastify = await getServer({
  logger: {
    enabled: env.NODE_ENV != "test",
    pretty: env.NODE_ENV == "development",
    loki: env.LOKI_HOST
      ? {
          basicAuth:
            env.LOKI_USERNAME && env.LOKI_PASSWORD
              ? {
                  password: env.LOKI_PASSWORD,
                  username: env.LOKI_USERNAME
                }
              : undefined,
          host: env.LOKI_HOST,
          name: `server-${env.SERVER_NUMBER}`
        }
      : undefined
  },
  cors: {
    origin: env.CORS_ORIGIN
  }
})

// REDIS
const redisClient = createClient(env.KEYDB_URL, fastify.log)
await redisClient.connect()

// GAME
const sessionFactory = new SessionFactory()
const sessionManager = new SessionManager(sessionFactory)
const controller = new Controller(
  sessionManager,
  redisClient,
  {
    serverNumber: env.SERVER_NUMBER
  },
  fastify.log
)

// REDIS SESSION SUBSCRIBER
const subscriber = await controller.sessionCache.initializeSubscriber()
if (subscriber.none) {
  throw new Error("Could not initialize sessionCache subscriber")
}
const [subscribe, subscriberCleanup] = subscriber.unwrap()

// FASTIFY PLUGINS
await fastify.register(websocketPlugin)

// INTERNAL PLUGINS
await fastify.register(gracefulShutdown, {
  async onSignal() {
    await subscriberCleanup()
    await controller.cleanSessionCache()
    await redisClient.disconnect()
  }
})
await fastify.register(memoryLogPlugin, { enabled: env.LOG_MEMORY })

// ROUTES
await fastify.register(gameRoutes, {
  controller,
  subscribe,
  prefix: "/ws"
})

await fastify.listen({
  port: env.PORT,
  host: "0.0.0.0"
})
