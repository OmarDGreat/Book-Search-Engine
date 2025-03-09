import express from "express";
import path from "node:path";
import type { Request, Response } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { authenticateToken } from "./services/auth.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

const startApolloServer = async () => {
  try {
    await server.start();
    await db; // Await the database connection

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
      "/graphql",
      expressMiddleware(server as any, {
        context: authenticateToken as any,
      })
    );

    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Client dist path:", path.join(__dirname, "../client/dist"));

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../client/dist")));

      app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
      });
    }

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startApolloServer();