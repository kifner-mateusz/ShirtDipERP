import { z } from "zod";

const idRequiredZodSchema = z.object({ id: z.number() });

export default idRequiredZodSchema;
