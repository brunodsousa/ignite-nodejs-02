import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { string, z } from "zod";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  // get all users
  app.get("/", async () => {
    const users = await knex("users").select();
    return users;
  });

  // get user by id
  app.get("/:id", async (request, reply) => {
    const getUserParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamSchema.parse(request.params);

    const user = await knex("users").where({ id }).first();

    if (!user) {
      return reply.status(404).send("User not found.");
    }

    return user;
  });

  // create new user
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (sessionId) {
      await knex("users").insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        email,
        password,
      });

      const user = await knex("users").where({ session_id: sessionId }).first();
      const updateUserCreatedMeals = await knex("meals")
        .where({ session_id: sessionId })
        .update({ user_id: user?.id });

      return reply.status(201).send();
    } else {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
      });

      await knex("users").insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        email,
        password,
      });

      return reply.status(201).send();
    }
  });

  // edit user
  app.patch("/:id", async (request, reply) => {
    const getUserParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamSchema.parse(request.params);

    const user = await knex("users").where({ id }).first();

    if (!user) {
      return reply.status(404).send("User not found.");
    }

    const editUserParamSchema = z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      password: z.string().optional(),
    });

    const { name, email, password } = editUserParamSchema.parse(request.body);

    await knex("users")
      .where({ id })
      .update({
        name: name || user.name,
        email: email || user.email,
        password: password || user.password,
      });
  });

  // delete user
  app.delete("/:id", async (request, reply) => {
    const getUserParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamSchema.parse(request.params);

    const user = await knex("users").where({ id }).first();

    if (!user) {
      return reply.status(404).send("User not found.");
    }

    await knex("users").where({ id }).del();
  });
}
