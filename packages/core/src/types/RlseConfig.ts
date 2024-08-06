import type { ReleaseSchemaType } from "../validation/validation";

export type RlseConfig = ReleaseSchemaType & {
  /**
   * Stop Release Flow
   *
   * @default false
   */
  isStopFlow: boolean;
};
