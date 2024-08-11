export const name = "db-graph-gen";

import { schemas } from "@shirterp/server";
import { pgGenerate } from "drizzle-dbml-generator"; // Using Postgres for this example

const out = "./schema.dbml";
const relational = true;

pgGenerate({ schema: schemas, out, relational });
