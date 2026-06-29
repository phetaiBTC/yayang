import { wrap } from '@mikro-orm/core';

/**
 * Serialize an entity (or array) to a plain object, respecting `hidden`
 * properties (e.g. Employee.password is never emitted).
 */
export function serialize<T extends object>(entity: T): Record<string, any>;
export function serialize<T extends object>(entity: T[]): Record<string, any>[];
export function serialize<T extends object>(entity: T | T[]) {
  return Array.isArray(entity)
    ? entity.map((e) => wrap(e).toObject())
    : wrap(entity).toObject();
}
