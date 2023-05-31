import { FastifyInstance } from "fastify";
import { knex } from "../database";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const schema = await knex("sqlite_schema").select("*");
    return schema;
  });
}
