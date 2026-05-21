import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { shouldOpenContentDetailEditor } from '../utils/contentDetailPage';

/**
 * Opens the detail edit panel once when `?edit=1` is present and moderation rules allow edits.
 * Resets when `routeId` changes so in-app navigation between entities does not reuse the flag.
 */
export function useContentDetailAutoEdit(params: {
  routeId: string | undefined;
  entityLoaded: boolean;
  showEditUi: boolean;
}) {
  const [searchParams] = useSearchParams();
  const autoEditApplied = useRef(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    autoEditApplied.current = false;
  }, [params.routeId]);

  useEffect(() => {
    if (
      !shouldOpenContentDetailEditor({
        entityLoaded: params.entityLoaded,
        showEditUi: params.showEditUi,
        editQueryValue: searchParams.get('edit'),
        alreadyApplied: autoEditApplied.current,
      })
    ) {
      return;
    }
    autoEditApplied.current = true;
    const schedule = window.setTimeout(() => setEditing(true), 0);
    return () => window.clearTimeout(schedule);
  }, [params.entityLoaded, params.showEditUi, searchParams]);

  return { editing, setEditing };
}
