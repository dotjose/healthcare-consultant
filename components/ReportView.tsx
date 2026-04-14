import type { TriageLevel, TriageReport } from "@/lib/api";
import { PatientIdentityBar } from "@/components/PatientIdentityBar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const levelStyles: Record<
  TriageLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "border-emerald-300/80 bg-emerald-50 text-emerald-900",
  },
  medium: {
    label: "Medium",
    className: "border-amber-300/80 bg-amber-50 text-amber-950",
  },
  high: {
    label: "High",
    className: "border-orange-300/80 bg-orange-50 text-orange-950",
  },
  emergency: {
    label: "Emergency",
    className: "border-red-300/80 bg-red-50 text-red-950",
  },
};

export function ReportView({
  report,
  patientId,
  patientCardNumber,
}: {
  report: TriageReport;
  patientId: string;
  patientCardNumber?: string | null;
}) {
  const triage = levelStyles[report.triage_level];

  return (
    <div className="space-y-8">
      <PatientIdentityBar patientId={patientId} cardNumber={patientCardNumber} />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Triage level</span>
        <Badge className={triage.className} variant="outline">
          {triage.label}
        </Badge>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Symptoms summary</CardTitle>
          <CardDescription>Structured intake overview (not a diagnosis).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground/90">{report.symptoms_summary}</p>
          <Separator />
          <div>
            <p className="mb-2 font-medium text-foreground">Possible categories</p>
            <ul className="list-inside list-disc space-y-1.5">
              {report.possible_categories.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Safety & next steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-2 font-medium text-foreground">Red flags</p>
            {report.red_flags.length === 0 ? (
              <p className="italic">None highlighted for this intake.</p>
            ) : (
              <ul className="list-inside list-disc space-y-1.5">
                {report.red_flags.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-medium text-foreground">Recommended next step</p>
            <p className="text-foreground/90">{report.recommended_next_step}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">For your visit</CardTitle>
          <CardDescription>Questions you can bring to a clinician.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {report.questions_to_ask_doctor.map((q) => (
              <li
                key={q}
                className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-foreground/90"
              >
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-muted/25 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base">Patient note</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          {report.patient_note}
        </CardContent>
      </Card>
    </div>
  );
}
