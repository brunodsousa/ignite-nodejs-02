import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
    };
    meals: {
      id: string;
      session_id?: string;
      user_id: string;
      name: string;
      description: string;
      date: string;
      time: string;
      is_on_the_diet: boolean;
      created_at: string;
    };
  }
}
