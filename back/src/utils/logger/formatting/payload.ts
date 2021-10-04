import prune from 'json-prune';
import { isError, isObject } from 'lodash';

interface TransformableInfo {
  level: string;
  message: string;
  [key: string]: any;
}

export function jsonFormat(info: TransformableInfo): TransformableInfo {
  const prunedInfo: { [key: string]: unknown } = JSON.parse(prune(info));

  for (const [key, value] of Object.entries(prunedInfo)) {
    info[key] = value;
  }

  info.message = info.message || info._message;
  delete info._message;

  return info;
}

export function formatPrune(info: TransformableInfo): TransformableInfo {
  for (const [key, value] of Object.entries(info)) {
    // FIXME: prune() will return undefined for an function and then parse will fail.
    // Right now we know it fails for Joi object with `annotate`, so we remove it manually.
    if (typeof value === 'function') {
      continue;
    }

    const isPropertyWritable = Object.getOwnPropertyDescriptor(
      info,
      key,
    )?.writable;
    const newValue = isObject(value)
      ? JSON.parse(
          prune(value, {
            depthDecr: 6,
          }),
        )
      : value;

    if (isPropertyWritable && newValue !== value) {
      info[key] = newValue;
    }
  }
  return info;
}

export function formatErrorEnrich(
  info: TransformableInfo,
  { depth }: { depth?: number } = {},
): TransformableInfo {
  if (!depth || depth <= 0) {
    return info;
  }

  for (const [key, value] of Object.entries(info)) {
    let newValue = value;

    if (isError(newValue)) {
      newValue = {
        ...newValue,
        // Copy error properties manually because they are not enumerable
        level: (newValue as any).level, // FIXME: fix typecheck
        stack: newValue.stack,
        message: newValue.message,
        name: newValue.name,
      };
    }
    if (isObject(newValue)) {
      newValue = formatErrorEnrich(
        newValue as any, // FIXME: fix typecheck
        depth ? { depth: depth - 1 } : undefined,
      );
    }

    const isPropertyWritable = Object.getOwnPropertyDescriptor(
      info,
      key,
    )?.writable;

    if (isPropertyWritable && newValue !== value) {
      info[key] = newValue;
    }
  }

  return info;
}
