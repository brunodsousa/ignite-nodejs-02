import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { z } from "zod";
import { knex } from "../database";

export async function mealsRoutes(app: FastifyInstance) {
  // get all meals
  app.get("/", async (request, reply) => {
    const { sessionId } = request.cookies;
    if (sessionId) {
      const meals = await knex("meals")
        .where({ session_id: sessionId })
        .select();
      return { meals };
    }
    return reply.status(404).send("No meals found.");
  });

  // get meal by ID
  app.get("/:id", async (request, reply) => {
    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealParamSchema.parse(request.params);
    const { sessionId } = request.cookies;

    const meal = await knex("meals")
      .where({ id, session_id: sessionId })
      .first();

    if (!meal) {
      return reply.status(404).send("Meal not found.");
    }

    return meal;
  });

  // create meal
  app.post("/", async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z
        .string()
        .min(10)
        .includes("-", { message: "The date must be in YYYY-MM-DD format." }),
      time: z
        .string()
        .min(5)
        .includes(":", { message: "The time must be in HH:mm format." }),
      is_on_the_diet: z.boolean(),
    });

    const { name, description, date, time, is_on_the_diet } =
      createMealBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (sessionId) {
      const sessionLinkedUser = await knex("users")
        .where({ session_id: sessionId })
        .first();
      await knex("meals").insert({
        id: randomUUID(),
        session_id: sessionLinkedUser?.session_id,
        user_id: sessionLinkedUser?.id,
        name,
        description,
        date,
        time,
        is_on_the_diet,
      });
      return reply.status(201).send();
    } else {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
      });
      await knex("meals").insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        description,
        date,
        time,
        is_on_the_diet,
      });
      return reply.status(201).send();
    }
  });
}
