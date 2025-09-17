export type RecoAttribution = {
  source: "AI_RECO";
  objectiveId: string;
  at: string;           // ISO timestamp
  sourceRefId: string;  // correlación end-to-end
};

const PREFIX = "reco:attr:";

export function newSourceRefId(): string {
  try {
    return `reco:${crypto.randomUUID()}`;
  } catch {
    return `reco:${Date.now()}`;
  }
}

export function setRecoAttribution(exerciseId: string, attr: RecoAttribution): void {
  try {
    sessionStorage.setItem(PREFIX + exerciseId, JSON.stringify(attr));
  } catch {
    /* noop */
  }
}

/** Lee y CONSUME la atribución (solo una vez). */
export function takeRecoAttribution(exerciseId: string): RecoAttribution | null {
  try {
    const key = PREFIX + exerciseId;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    return JSON.parse(raw) as RecoAttribution;
  } catch {
    return null;
  }
}
