import process from "node:process";
import consola from "consola";
import { RlseFlowError } from "../flow/errors";
import { runFlow } from "../flow/runFlow";
import type { RlseConfig } from "../types/RlseConfig";
import { parseFlowSchema, parseReleaseSchema } from "../validation/validation";

export const releaseAction = async (
  options: unknown,
  args: Record<string, string | boolean> = {},
  initialContext?: { dryRun?: boolean },
) => {
  try {
    const config = parseReleaseSchema(options);
    const flow = resolveFlow(config, args);
    await runFlow(parseFlowSchema(flow), initialContext);
  } catch (error) {
    logReleaseError(error);
    process.exit(1);
  }
};

const resolveFlow = (
  config: RlseConfig,
  args: Record<string, string | boolean>,
) => {
  if (Array.isArray(config)) {
    return config;
  }

  return config.flow({
    args: config.args.parse(args),
  });
};

const logReleaseError = (error: unknown) => {
  if (!(error instanceof RlseFlowError)) {
    consola.error(error);
    return;
  }

  consola.error(error.message);
  logErrorCause("Cause", error.failed.error);

  if (error.failed.partialResult !== undefined) {
    consola.info("Partial result", error.failed.partialResult);
  }

  for (const rollback of error.rollbackFailures) {
    consola.error(`Rollback failed at ${rollback.step}`);
    logErrorCause("Rollback cause", rollback.error);
  }
};

const logErrorCause = (label: string, error: unknown) => {
  if (error instanceof AggregateError) {
    consola.error(`${label}: ${error.message}`);

    for (const nestedError of error.errors) {
      logErrorCause("Nested cause", nestedError);
    }

    return;
  }

  consola.error(label, error);
};
