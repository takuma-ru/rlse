import type { RlseResults, RlseStepResult } from "./types";

export class RlseStepError<TPartial = unknown> extends Error {
  readonly cause: unknown;
  readonly partialResult?: TPartial;

  constructor(
    message: string,
    options: {
      cause?: unknown;
      partialResult?: TPartial;
    } = {},
  ) {
    super(message);
    this.name = "RlseStepError";
    this.cause = options.cause;
    this.partialResult = options.partialResult;
  }
}

export class RlseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RlseConfigError";
  }
}

export class RlseCliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RlseCliError";
  }
}

export type RlseStepFailed<TPartial = unknown> = {
  step: string;
  status: "failed";
  error: unknown;
  partialResult?: TPartial;
};

export type RlseStepRolledBack = {
  step: string;
  status: "rolledBack";
  result: RlseStepResult;
};

export type RlseStepRollbackFailed = {
  step: string;
  status: "rollbackFailed";
  result: RlseStepResult;
  error: unknown;
};

export type RlseRollbackResult = RlseStepRolledBack | RlseStepRollbackFailed;

export class RlseFlowError<TPartial = unknown> extends Error {
  readonly cause: unknown;
  readonly failed: RlseStepFailed<TPartial>;
  readonly succeeded: RlseResults;
  readonly rollbacks: RlseRollbackResult[];

  constructor(options: {
    failed: RlseStepFailed<TPartial>;
    succeeded: RlseResults;
    rollbacks: RlseRollbackResult[];
  }) {
    super(createFlowErrorMessage(options.failed));
    this.name = "RlseFlowError";
    this.cause = options.failed.error;
    this.failed = options.failed;
    this.succeeded = options.succeeded;
    this.rollbacks = options.rollbacks;
  }

  get rollbackFailures() {
    return this.rollbacks.filter(
      (rollback): rollback is RlseStepRollbackFailed =>
        rollback.status === "rollbackFailed",
    );
  }
}

const createFlowErrorMessage = (failed: RlseStepFailed) => {
  const causeMessage = getErrorMessage(failed.error);

  if (!causeMessage) {
    return `Release flow failed at ${failed.step}`;
  }

  return `Release flow failed at ${failed.step}: ${causeMessage}`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return undefined;
};
