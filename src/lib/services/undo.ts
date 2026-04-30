import type { AuditEvent, SenderAction } from "../domain.ts";
import { AppError } from "../errors.ts";
import type { GmailClient } from "../gmail/client.ts";
import { newId, nowIso } from "../ids.ts";
import type { AppStore } from "../storage/store.ts";

export async function undoActions({
  userId,
  actionIds,
  gmail,
  store,
}: {
  userId: string;
  actionIds?: string[];
  gmail: GmailClient;
  store: AppStore;
}) {
  const actions = await store.listActions(userId);
  const selected = actionIds?.length
    ? actions.filter((action) => actionIds.includes(action.id))
    : actions.filter((action) => action.reversible).slice(0, 25);

  if (selected.length === 0) {
    throw new AppError({
      code: "NO_REVERSIBLE_ACTIONS",
      message: "No reversible InboxExorcist actions were found.",
      status: 404,
    });
  }

  let removedFilters = 0;
  const failures: string[] = [];
  const undoActionsToRecord: SenderAction[] = [];
  const audits: AuditEvent[] = [];

  for (const action of selected) {
    const filters = await store.listFiltersByAction(action.id, userId);
    for (const filter of filters) {
      try {
        await gmail.deleteFilter(filter.gmailFilterId);
        await store.markFilterDeleted(filter.id, userId);
        removedFilters += 1;
      } catch {
        failures.push(filter.senderDomain);
      }
    }

    const createdAt = nowIso();
    const undoAction: SenderAction = {
      id: newId("action"),
      userId,
      scanRunId: action.scanRunId,
      senderDomain: action.senderDomain,
      actionType: "undo",
      result: failures.length ? "UNDO_PARTIAL" : "UNDO_COMPLETED",
      reversible: false,
      errorCode: failures.length ? "UNDO_PARTIALLY_COMPLETED" : undefined,
      createdAt,
    };
    undoActionsToRecord.push(undoAction);
    audits.push({
      id: newId("audit"),
      userId,
      actor: "user",
      actionType: "undo",
      targetSenderDomain: action.senderDomain,
      result: undoAction.result,
      errorCode: undoAction.errorCode,
      createdAt,
    });
  }

  await store.recordActions({ actions: undoActionsToRecord, auditEvents: audits });

  return {
    removedFilters,
    failures,
    result: failures.length ? "UNDO_PARTIAL" : "UNDO_COMPLETED",
  };
}
