export function formatResponse(
  data: unknown,
  errCode?: number,
  errMsg?: unknown
): any {
  let serializedData = data;
  if (typeof data === 'object') {
    serializedData = JSON.stringify(data);
  }

  return {
    data: data !== undefined ? serializedData : '{}',
    errCode: errCode || 0,
    errMsg: errMsg === undefined ? '' : formatError(errMsg),
  };
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    const serialized = JSON.stringify(error);
    return serialized === undefined ? String(error) : serialized;
  } catch {
    return String(error);
  }
}
