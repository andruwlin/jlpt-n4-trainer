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
};

export type LearningProgressState = {
  version: 1;
  results: ExamResultRecord[];
  weakItems: WeakItemRecord[];
};

export type TodayStats = {
  questionCount: number;
  examCount: number;
  lastAccuracy?: number;
  totalExamCount: number;
};

const STORAGE_KEY = "jlpt-trainer-progress-v1";
const MAX_RESULTS = 100;

const emptyProgress: LearningProgressState = {
  version: 1,
  results: [],
  weakItems: [],
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

    return parsed;
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
            }
          : weakItem,
      )
    : [
        {
          id: `${item.kind}-${item.sourceId}`,
          ...item,
          wrongCount: 1,
          lastWrongAt: now,
        },
        ...progress.weakItems,
      ];

  saveProgress({ ...progress, weakItems: nextWeakItems });
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
