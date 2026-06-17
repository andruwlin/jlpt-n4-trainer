export type ExamKind = "vocabulary" | "grammar" | "conjugation";
export type ExamResultKind = ExamKind | "daily";
export type ProgressLevel = "N5" | "N4" | "Mixed";

export type ExamResultRecord = {
  id: string;
  kind: ExamResultKind;
  level: ProgressLevel;
  questionType: string;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  completedAt: string;
};

export type WeakItemRecord = {
  id: string;
  kind: ExamKind;
  sourceId: string;
  label: string;
  level?: "N5" | "N4";
  wrongCount: number;
  lastWrongAt: string;
  correctReviewCount?: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  ease?: number;
};

export type RecentlySeenItem = {
  kind: ExamKind;
  sourceId: string;
  seenAt: string;
};

export type LearningProgressState = {
  version: 1;
  results: ExamResultRecord[];
  weakItems: WeakItemRecord[];
  recentlySeen?: RecentlySeenItem[];
};

export type TodayStats = {
  questionCount: number;
  examCount: number;
  lastAccuracy?: number;
  totalExamCount: number;
};

export type ReviewStats = {
  dueCount: number;
  totalWeakItems: number;
  topDueItems: WeakItemRecord[];
  nextReviewAt?: string;
};

const STORAGE_KEY = "jlpt-trainer-progress-v1";
const MAX_RESULTS = 100;
const MAX_RECENTLY_SEEN = 250;
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14];

const emptyProgress: LearningProgressState = {
  version: 1,
  results: [],
  weakItems: [],
  recentlySeen: [],
};

export function getProgress(): LearningProgressState {
  const storage = getStorage();
  if (!storage) {
    return emptyProgress;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyProgress;
    }

    const parsed = JSON.parse(raw) as LearningProgressState;
    if (parsed.version !== 1 || !Array.isArray(parsed.results) || !Array.isArray(parsed.weakItems)) {
      return emptyProgress;
    }

    return {
      ...parsed,
      weakItems: parsed.weakItems.map(normalizeWeakItem),
      recentlySeen: Array.isArray(parsed.recentlySeen) ? parsed.recentlySeen : [],
    };
  } catch {
    return emptyProgress;
  }
}

export function saveExamResult(record: ExamResultRecord) {
  const progress = getProgress();
  const nextProgress: LearningProgressState = {
    ...progress,
    results: [record, ...progress.results.filter((item) => item.id !== record.id)].slice(0, MAX_RESULTS),
  };

  saveProgress(nextProgress);
}

export function recordWeakItem(item: Omit<WeakItemRecord, "id" | "wrongCount" | "lastWrongAt">) {
  const progress = getProgress();
  const now = new Date().toISOString();
  const existing = progress.weakItems.find(
    (weakItem) => weakItem.kind === item.kind && weakItem.sourceId === item.sourceId,
  );

  const nextWeakItems = existing
    ? progress.weakItems.map((weakItem) =>
        weakItem.id === existing.id
          ? {
              ...weakItem,
              label: item.label,
              level: item.level,
              wrongCount: weakItem.wrongCount + 1,
              lastWrongAt: now,
              nextReviewAt: now,
              ease: weakItem.ease ?? 1,
            }
          : weakItem,
      )
    : [
        {
          id: `${item.kind}-${item.sourceId}`,
          ...item,
          wrongCount: 1,
          lastWrongAt: now,
          correctReviewCount: 0,
          nextReviewAt: now,
          ease: 1,
        },
        ...progress.weakItems,
      ];

  saveProgress({ ...progress, weakItems: nextWeakItems });
}

export function recordRecentlySeen(item: Omit<RecentlySeenItem, "seenAt">) {
  const progress = getProgress();
  const now = new Date().toISOString();
  const recentlySeen = progress.recentlySeen ?? [];
  const nextRecentlySeen = [
    { ...item, seenAt: now },
    ...recentlySeen.filter(
      (seenItem) => !(seenItem.kind === item.kind && seenItem.sourceId === item.sourceId),
    ),
  ].slice(0, MAX_RECENTLY_SEEN);

  saveProgress({ ...progress, recentlySeen: nextRecentlySeen });
}

export function getRecentlySeen(kind?: ExamKind) {
  const recentlySeen = getProgress().recentlySeen ?? [];
  return kind ? recentlySeen.filter((item) => item.kind === kind) : recentlySeen;
}

export function getRecentlySeenSourceIds(kind: ExamKind) {
  return getRecentlySeen(kind).map((item) => item.sourceId);
}

export function clearProgress() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function getTodayStats(): TodayStats {
  const progress = getProgress();
  const today = new Date().toDateString();
  const todayResults = progress.results.filter((result) => new Date(result.completedAt).toDateString() === today);

  return {
    questionCount: todayResults.reduce((sum, result) => sum + result.total, 0),
    examCount: todayResults.length,
    lastAccuracy: progress.results[0]?.accuracy,
    totalExamCount: progress.results.length,
  };
}

export function getRecentResults(limit = 10) {
  return getProgress().results.slice(0, limit);
}

export function getAccuracyByKind(): Record<ExamKind, number | undefined> {
  const progress = getProgress();
  const kinds: ExamKind[] = ["vocabulary", "grammar", "conjugation"];

  return kinds.reduce(
    (result, kind) => {
      const records = progress.results.filter((record) => record.kind === kind);
      const total = records.reduce((sum, record) => sum + record.total, 0);
      const correct = records.reduce((sum, record) => sum + record.correct, 0);

      result[kind] = total > 0 ? Math.round((correct / total) * 100) : undefined;
      return result;
    },
    {} as Record<ExamKind, number | undefined>,
  );
}

export function getWeakItems(limit = 10) {
  return [...getProgress().weakItems]
    .sort((a, b) => {
      if (b.wrongCount !== a.wrongCount) {
        return b.wrongCount - a.wrongCount;
      }

      return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
    })
    .slice(0, limit);
}

export function getDueWeakItems(progress = getProgress(), now = new Date()) {
  return progress.weakItems
    .filter((item) => isWeakItemDue(item, now))
    .sort((a, b) => getWeakItemPriority(b, now) - getWeakItemPriority(a, now));
}

export function getWeakItemPriority(item: WeakItemRecord, now = new Date(), recentlySeenSourceIds: string[] = []) {
  const nextReviewTime = getReviewTime(item.nextReviewAt ?? item.lastWrongAt);
  const overdueHours = Math.max(0, now.getTime() - nextReviewTime) / 36e5;
  const dueBoost = nextReviewTime <= now.getTime() ? 1000 : 0;
  const recentlySeenPenalty = recentlySeenSourceIds.includes(item.sourceId) && dueBoost === 0 ? 250 : 0;

  return dueBoost + item.wrongCount * 100 + Math.min(overdueHours, 240) - recentlySeenPenalty;
}

export function updateWeakItemAfterReview(item: WeakItemRecord, isCorrect: boolean, now = new Date()): WeakItemRecord {
  const nowIso = now.toISOString();

  if (!isCorrect) {
    return {
      ...item,
      wrongCount: item.wrongCount + 1,
      correctReviewCount: 0,
      lastWrongAt: nowIso,
      lastReviewedAt: nowIso,
      nextReviewAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      ease: item.ease ?? 1,
    };
  }

  const correctReviewCount = (item.correctReviewCount ?? 0) + 1;
  const dayOffset = REVIEW_INTERVAL_DAYS[Math.min(correctReviewCount, REVIEW_INTERVAL_DAYS.length) - 1];

  return {
    ...item,
    correctReviewCount,
    lastReviewedAt: nowIso,
    nextReviewAt: addDays(now, dayOffset).toISOString(),
    ease: item.ease ?? 1,
  };
}

export function recordWeakItemReview(kind: ExamKind, sourceId: string, isCorrect: boolean) {
  const progress = getProgress();
  const weakItem = progress.weakItems.find((item) => item.kind === kind && item.sourceId === sourceId);
  if (!weakItem) {
    return;
  }

  const updated = updateWeakItemAfterReview(weakItem, isCorrect);
  saveProgress({
    ...progress,
    weakItems: progress.weakItems.map((item) => (item.id === weakItem.id ? updated : item)),
  });
}

export function getReviewStats(progress = getProgress(), limit = 5, now = new Date()): ReviewStats {
  const dueItems = getDueWeakItems(progress, now);
  const futureItems = progress.weakItems
    .filter((item) => !isWeakItemDue(item, now) && item.nextReviewAt)
    .sort((a, b) => getReviewTime(a.nextReviewAt) - getReviewTime(b.nextReviewAt));

  return {
    dueCount: dueItems.length,
    totalWeakItems: progress.weakItems.length,
    topDueItems: dueItems.slice(0, limit),
    nextReviewAt: futureItems[0]?.nextReviewAt,
  };
}

function normalizeWeakItem(item: WeakItemRecord): WeakItemRecord {
  return {
    ...item,
    wrongCount: typeof item.wrongCount === "number" ? item.wrongCount : 1,
    correctReviewCount: typeof item.correctReviewCount === "number" ? item.correctReviewCount : 0,
    nextReviewAt: item.nextReviewAt ?? item.lastWrongAt,
    ease: typeof item.ease === "number" ? item.ease : 1,
  };
}

function isWeakItemDue(item: WeakItemRecord, now: Date) {
  return getReviewTime(item.nextReviewAt ?? item.lastWrongAt) <= now.getTime();
}

function getReviewTime(value?: string) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function saveProgress(progress: LearningProgressState) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota or private-mode errors.
  }
}

function getStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
