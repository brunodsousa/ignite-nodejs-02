import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.uuid("session_id").notNullable().index();
    table.text("name").notNullable();
    table.text("description").notNullable();
    table.date("date").notNullable();
    table.time("time").notNullable();
    table.boolean("is_on_the_diet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
