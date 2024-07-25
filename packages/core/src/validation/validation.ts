import { z } from "zod";

export const releaseSchema = z.object({
  name: z.string().min(1, {
    message: "Invalid package name",
  }),
  pre: z.boolean().optional().default(false),
  level: z.union(
    [
      z.literal("patch"),
      z.literal("minor"),
      z.literal("major"),
      z.literal("preup"),
    ],
    {
      message: "Invalid release level",
    }
  ),
  buildCmd: z.string().min(1, {
    message: "Invalid build command",
  }),
  dryRun: z.boolean().optional().default(false),
});

export type ReleaseSchemaType = z.infer<typeof releaseSchema>;
