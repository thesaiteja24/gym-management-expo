/**
 * Template Reconciler
 *
 * Handles state reconciliation after sync operations.
 * Updates local state with backend responses.
 */

import { useTemplate } from "@/stores/templateStore";
import { SyncStatus } from "../types";

/**
 * Reconcile a template's ID after successful CREATE sync.
 * Updates the local template with the backend-generated ID.
 */
export function reconcileTemplateId(clientId: string, dbId: string): void {
  const state = useTemplate.getState();
  const templates = state.templates;

  const updatedTemplates = templates.map((item) => {
    if ((item as any).clientId === clientId) {
      return {
        ...item,
        id: dbId,
        syncStatus: "synced" as SyncStatus,
      };
    }
    return item;
  });

  useTemplate.setState({ templates: updatedTemplates as any });
}

/**
 * Update sync status for a template by clientId
 */
export function updateTemplateSyncStatus(
  clientId: string,
  syncStatus: SyncStatus,
): void {
  const state = useTemplate.getState();
  const templates = state.templates;

  const updatedTemplates = templates.map((item) => {
    if ((item as any).clientId === clientId) {
      return { ...item, syncStatus };
    }
    return item;
  });

  useTemplate.setState({ templates: updatedTemplates as any });
}

/**
 * Remove a template from local state by clientId (for failed items or rollback)
 */
export function removeTemplateByClientId(clientId: string): void {
  const state = useTemplate.getState();
  const updatedTemplates = state.templates.filter(
    (item) => (item as any).clientId !== clientId,
  );
  useTemplate.setState({ templates: updatedTemplates });
}

/**
 * Mark template as synced after successful UPDATE
 */
export function markTemplateSynced(clientId: string): void {
  updateTemplateSyncStatus(clientId, "synced");
}

/**
 * Mark template as failed after sync failure
 */
export function markTemplateFailed(clientId: string): void {
  updateTemplateSyncStatus(clientId, "failed");
}
