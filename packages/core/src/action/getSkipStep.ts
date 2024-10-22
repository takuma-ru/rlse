import type { ReleaseSchemaType } from "../validation/validation";

export const getSkipStep = (skipStep: ReleaseSchemaType["skipStep"]) => {
  const isConfigStepSkipped = skipStep?.includes("config") ?? false;
  const isCommitChangesStepSkipped
    = skipStep?.includes("commit-changes") ?? false;
  const isBuildStepSkipped = skipStep?.includes("build") ?? false;
  const isPublishStepSkipped = skipStep?.includes("publish") ?? false;
  const isCreateReleaseBranchStepSkipped
    = skipStep?.includes("create-release-branch") ?? false;

  const isAllStepSkipped
    = isConfigStepSkipped
    && isCommitChangesStepSkipped
    && isBuildStepSkipped
    && isPublishStepSkipped
    && isCreateReleaseBranchStepSkipped;

  return {
    isAllStepSkipped,
    isConfigStepSkipped,
    isCommitChangesStepSkipped,
    isBuildStepSkipped,
    isPublishStepSkipped,
    isCreateReleaseBranchStepSkipped,
  };
};
