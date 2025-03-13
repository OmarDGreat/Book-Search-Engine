import express from "express";
import path from "node:path";
import type { Request, Response } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { authenticateToken } from "./services/auth.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";

// test
import { fileURLToPath } from "url";
import { dirname } from "path";

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Convert PORT to a number
const PORT = parseInt(process.env.PORT as string, 10) || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

const startApolloServer = async () => {
  try {
    await server.start();
    await db;

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
      "/graphql",
      expressMiddleware(server as any, {
        context: async (contextParams) => {
          try {
            return await authenticateToken(contextParams);
          } catch (error) {
            console.error("Authentication error:", error);
            throw error;
          }
        },
      })
    );

    if (process.env.NODE_ENV === "production") {
      // Serve static files from the React app
      const clientPath = path.join(__dirname, "../../client/dist");
      app.use(express.static(clientPath));

      // Handle React routing, return all requests to React app
      app.get("*", (_req: Request, res: Response) => {
        try {
          const indexPath = path.join(clientPath, "index.html");
          res.sendFile(indexPath);
        } catch (error) {
          console.error("Error serving index.html:", error);
          res.status(500).send("Error serving application");
        }
      });
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startApolloServer();
