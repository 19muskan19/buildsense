export interface OfflineDraft {
  localDraftId: string;
  buildingId: string;
  buildingName: string;
  elementId?: string;
  inspectorId: string;
  inspectorName: string;
  inspectionMethod: string;
  inspectionDate: string;
  weather: string;
  checklistResults: any[];
  NDTReadings: any[];
  photoIds: string[];
  summaryNotes: string;
  capturedAt: string;
  syncStatus: 'LOCAL_DRAFT' | 'WAITING_TO_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

import { syncOfflineInspections } from './api';

const STORAGE_KEY = 'buildsense_offline_drafts';
const LAST_SYNC_KEY = 'buildsense_last_sync_time';

export function getOfflineDrafts(): OfflineDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading offline drafts', e);
    return [];
  }
}

export function saveOfflineDraft(draft: OfflineDraft): void {
  const drafts = getOfflineDrafts();
  const existingIndex = drafts.findIndex((d) => d.localDraftId === draft.localDraftId);
  if (existingIndex !== -1) {
    drafts[existingIndex] = draft;
  } else {
    drafts.unshift(draft);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function removeOfflineDraft(localDraftId: string): void {
  const drafts = getOfflineDrafts().filter((d) => d.localDraftId !== localDraftId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export async function syncPendingDrafts(): Promise<{ synced: number; failed: number }> {
  const drafts = getOfflineDrafts();
  const pending = drafts.filter((d) => d.syncStatus === 'WAITING_TO_SYNC' || d.syncStatus === 'FAILED' || d.syncStatus === 'LOCAL_DRAFT');

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  try {
    const data = await syncOfflineInspections(pending);
    if (data.success) {
      // Mark as synced or remove
      const updated = drafts.map((d) => {
        if (pending.some((p) => p.localDraftId === d.localDraftId)) {
          return { ...d, syncStatus: 'SYNCED' as const };
        }
        return d;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      synced = pending.length;
    } else {
      failed = pending.length;
    }
  } catch (err: any) {
    console.error('Offline sync failed network error', err);
    const updated = drafts.map((d) => {
      if (pending.some((p) => p.localDraftId === d.localDraftId)) {
        return { ...d, syncStatus: 'FAILED' as const, errorMessage: err.message || 'Network disconnected' };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    failed = pending.length;
  }

  return { synced, failed };
}
