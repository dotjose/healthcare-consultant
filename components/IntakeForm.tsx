"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIntake, type IntakePayload } from "@/lib/api";

export function IntakeForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [patientCardNumber, setPatientCardNumber] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ageNum = Number.parseInt(age, 10);
    const sev = Number.parseInt(severity, 10);
    if (Number.isNaN(ageNum) || ageNum < 0) {
      setError("Please enter a valid age.");
      return;
    }
    if (!symptoms.trim() || !duration.trim()) {
      setError("Symptoms and duration are required.");
      return;
    }
    if (Number.isNaN(sev) || sev < 1 || sev > 10) {
      setError("Severity must be between 1 and 10.");
      return;
    }

    const payload: IntakePayload = {
      age: ageNum,
      gender: gender.trim() || null,
      symptoms: symptoms.trim(),
      duration: duration.trim(),
      severity: sev,
      patient_card_number: patientCardNumber.trim() || null,
    };

    setLoading(true);
    try {
      const token = await getToken();
      const res = await createIntake(token, payload);
      router.push(`/reports/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-border/80 bg-muted/20 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Patient reference
        </h3>
        <div className="space-y-2">
          <Label htmlFor="patient_card_number">Card / MRN (optional)</Label>
          <Input
            id="patient_card_number"
            value={patientCardNumber}
            onChange={(e) => setPatientCardNumber(e.target.value)}
            placeholder="Clinic card, internal MRN, or leave blank"
            autoComplete="off"
            className="font-mono"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            A unique <strong>Patient intake ID</strong> is assigned automatically when you submit. Use
            this field only if you need to tie the intake to an existing in-house number.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 42"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender (optional)</Label>
          <Input
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe what you are experiencing."
          rows={5}
          required
          className="min-h-[120px] resize-y"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 3 days"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="severity">Severity (1–10)</Label>
          <Input
            id="severity"
            type="number"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full shadow-md sm:w-auto" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing patient data...
          </>
        ) : (
          "Generate intake report"
        )}
      </Button>
    </form>
  );
}
