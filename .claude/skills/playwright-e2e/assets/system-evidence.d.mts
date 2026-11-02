export interface ClassifiedOperation {
  expectedStatuses: number[];
}

export type OperationResponseClassification =
  | { accepted: true }
  | { accepted: false; reason: 'server-error' | 'unexpected-status' };

export function classifyOperationResponse(
  operation: ClassifiedOperation,
  status: number,
): OperationResponseClassification;
