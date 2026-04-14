const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type TriageLevel = "low" | "medium" | "high" | "emergency";

export type TriageReport = {
  symptoms_summary: string;
  possible_categories: string[];
  triage_level: TriageLevel;
  red_flags: string[];
  recommended_next_step: string;
  questions_to_ask_doctor: string[];
  patient_note: string;
};

export type IntakePayload = {
  age: number;
  gender?: string | null;
  symptoms: string;
  duration: string;
  severity: number;
  patient_card_number?: string | null;
};

export type ReportListItem = {
  id: string;
  patient_id: string;
  patient_card_number: string | null;
  created_at: string;
  triage_level: TriageLevel;
  symptoms_preview: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      detail?: unknown;
      error?: unknown;
      step?: unknown;
    };
    if (typeof data.error === "string" && typeof data.step === "string") {
      return `${data.error} (step: ${data.step})`;
    }
    if (typeof data.detail === "string") return data.detail;
    return res.statusText || "Request failed";
  } catch {
    return res.statusText || "Request failed";
  }
}

export async function createIntake(
  token: string | null,
  body: IntakePayload,
): Promise<{
  id: string;
  patient_id: string;
  patient_card_number: string | null;
  report: TriageReport;
  used_ai_fallback?: boolean;
}> {
  const res = await fetch(`${API_URL}/v1/intake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<{
    id: string;
    patient_id: string;
    patient_card_number: string | null;
    report: TriageReport;
    used_ai_fallback?: boolean;
  }>;
}

export async function listReports(token: string | null): Promise<ReportListItem[]> {
  const res = await fetch(`${API_URL}/v1/reports`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ReportListItem[]>;
}

export type ReportDetail = {
  id: string;
  patient_id: string;
  created_at: string;
  intake: IntakePayload;
  report: TriageReport;
};

export async function getReport(
  token: string | null,
  id: string,
): Promise<ReportDetail> {
  const res = await fetch(`${API_URL}/v1/reports/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ReportDetail>;
}
