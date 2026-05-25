import type {
  RlseContext,
  RlseFlowStep,
  RlseResults,
  RlseStep,
  RlseStepResult,
} from "./types";
import {
  RlseFlowError,
  RlseStepError,
  type RlseRollbackResult,
  type RlseStepFailed,
} from "./errors";

const normalizeStep = (step: RlseFlowStep): RlseStep => {
  if (typeof step === "function") {
    return {
      name: step.name || "custom",
      run: step,
    };
  }

  return step;
};

const createResults = (results: RlseStepResult[] = []): RlseResults => {
  Object.defineProperty(results, "findStep", {
    value(step: string) {
      const result = results.findLast((item) => item.step === step);

      if (!result) {
        throw new RlseStepError(`${step} result was not found`);
      }

      return result.value;
    },
  });

  return results as RlseResults;
};

type RlseInitialContext = Partial<Omit<RlseContext, "results">> & {
  results?: RlseStepResult[];
};

export const runFlow = async (
  flow: RlseFlowStep[],
  initialContext?: RlseInitialContext,
) => {
  const context: RlseContext = {
    cwd: process.cwd(),
    dryRun: false,
    ...initialContext,
    results: createResults([...(initialContext?.results ?? [])]),
  };
  const completedSteps: { step: RlseStep; result: RlseStepResult }[] = [];

  for (const flowStep of flow) {
    const step = normalizeStep(flowStep);

    try {
      const value = await step.run(context);
      const result = { step: step.name, value };
      context.results.push(result);
      completedSteps.push({ step, result });
    } catch (error) {
      const rollbacks = await rollbackCompletedSteps(context, completedSteps);

      throw new RlseFlowError({
        failed: createFailedStepResult(step.name, error),
        succeeded: context.results,
        rollbacks,
      });
    }
  }

  return context;
};

const createFailedStepResult = (
  step: string,
  error: unknown,
): RlseStepFailed => ({
  step,
  status: "failed",
  error,
  partialResult:
    error instanceof RlseStepError ? error.partialResult : undefined,
});

const rollbackCompletedSteps = async (
  context: RlseContext,
  completedSteps: { step: RlseStep; result: RlseStepResult }[],
) => {
  const rollbacks: RlseRollbackResult[] = [];

  for (const { step, result } of [...completedSteps].reverse()) {
    if (!step.rollback) {
      continue;
    }

    try {
      await step.rollback(context, result);
      rollbacks.push({
        step: step.name,
        status: "rolledBack",
        result,
      });
    } catch (error) {
      rollbacks.push({
        step: step.name,
        status: "rollbackFailed",
        result,
        error,
      });
    }
  }

  return rollbacks;
};
