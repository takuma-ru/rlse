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
  noRun: z.boolean().optional().default(false),
});

export const parseReleaseSchema = (options: unknown) => {
  try {
    return releaseSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.errors);
    }
  }
};

export type ReleaseSchemaType = z.infer<typeof releaseSchema>;
