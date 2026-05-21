import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA } from './defaultProfileDetailSchema';
import {
  PROFILE_DETAIL_SECTION_TYPES,
  type ProfileDetailGridSchema,
  type ProfileDetailSectionType,
} from './profileDetailGridTypes';

export type ParseProfileDetailGridErrorCode =
  | 'invalid_json'
  | 'invalid_root'
  | 'missing_items'
  | 'invalid_item'
  | 'missing_item_id'
  | 'duplicate_item_id'
  | 'unknown_section_type';

export type ParseProfileDetailGridResult =
  | { ok: true; schema: ProfileDetailGridSchema }
  | { ok: false; error: ParseProfileDetailGridErrorCode };

function isSectionType(value: unknown): value is ProfileDetailSectionType {
  return (
    typeof value === 'string' &&
    PROFILE_DETAIL_SECTION_TYPES.includes(value as ProfileDetailSectionType)
  );
}

/**
 * Validates operator-edited profile grid JSON from the API.
 * Empty input falls back to {@link DEFAULT_PROFILE_DETAIL_GRID_SCHEMA}.
 * Legacy `profileBackNav` tiles are dropped so old DB rows stay compatible after nav removal.
 */
export function parseProfileDetailGridSchema(
  gridSchemaJson: string | null | undefined
): ParseProfileDetailGridResult {
  if (!gridSchemaJson?.trim()) {
    return { ok: true, schema: DEFAULT_PROFILE_DETAIL_GRID_SCHEMA };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(gridSchemaJson);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'invalid_root' };
  }

  const root = parsed as Record<string, unknown>;
  const items = root.items;
  if (!Array.isArray(items)) {
    return { ok: false, error: 'missing_items' };
  }

  const ids = new Set<string>();
  const normalizedItems: ProfileDetailGridSchema['items'] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid_item' };
    const item = raw as Record<string, unknown>;
    if (item.sectionType === 'profileBackNav') continue;
    if (typeof item.i !== 'string' || !item.i) return { ok: false, error: 'missing_item_id' };
    if (ids.has(item.i)) return { ok: false, error: 'duplicate_item_id' };
    ids.add(item.i);
    if (!isSectionType(item.sectionType)) return { ok: false, error: 'unknown_section_type' };
    normalizedItems.push(item as ProfileDetailGridSchema['items'][number]);
  }

  const breakpoints =
    root.breakpoints && typeof root.breakpoints === 'object'
      ? (root.breakpoints as Record<string, number>)
      : DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.breakpoints;
  const cols =
    root.cols && typeof root.cols === 'object'
      ? (root.cols as Record<string, number>)
      : DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.cols;
  const rowHeight =
    typeof root.rowHeight === 'number'
      ? root.rowHeight
      : DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.rowHeight;

  return {
    ok: true,
    schema: {
      schemaVersion: typeof root.schemaVersion === 'number' ? root.schemaVersion : 1,
      items: normalizedItems,
      breakpoints,
      cols,
      rowHeight,
    },
  };
}
