export const name = "db-graph-gen";

import * as schema from "@shirterp/server/db/schemas";
import { pgGenerate } from "drizzle-dbml-generator"; // Using Postgres for this example

const out = "./schema.dbml";
const relational = true;

pgGenerate({ schema, out, relational });
