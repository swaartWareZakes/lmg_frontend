"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";

const areaOptions = [
  { value: "front", label: "Front" },
  { value: "rear", label: "Rear" },
  { value: "side", label: "Side" },
  { value: "suspension", label: "Suspension / Wheel" },
  { value: "mechanical", label: "Mechanical" },
  { value: "glass", label: "Glass" },
  { value: "interior", label: "Interior" },
  { value: "multiple", label: "Multiple Areas" },
];

const checklist = [
  ["bumper_damaged", "Bumper damaged / loose / missing"],
  ["grille_damage", "Grille or centre trim damaged"],
  ["headlamp_damage", "Headlamp / bracket / wiring damage"],
  ["bonnet_alignment", "Bonnet gaps or latch alignment issue"],
  ["fender_damage", "Fender / wheel arch damage"],
  ["door_alignment", "Door gap or opening issue"],
  ["paint_broken", "Paint cracked/scratched through"],
  ["suspension_suspected", "Suspension or steering damage suspected"],
  ["fluid_leak", "Fluid leak present"],
  ["warning_lights", "Warning lights present"],
  ["airbag_deployed", "Airbag deployed"],
  ["not_drivable", "Vehicle not safe to drive"],
];

type Props = {
  jobId: string;
  readOnly?: boolean;
  onSaved?: () => void;
};

export default function DamageIntakeForm({ jobId, readOnly = false, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    incident_description: "",
    incident_type: "collision",
    damage_area_primary: "front",
    damage_areas: ["front"],
    visible_damage: {},
    safety_flags: {},
    mechanical_flags: {},
    electrical_flags: {},
    glass_flags: {},
    drivability_status: "unknown",
    odometer_reading: "",
    warning_lights_present: false,
    fluid_leak_present: false,
    airbag_deployed: false,
    tow_required: false,
    technician_notes: "",
    technician_voice_summary: "",
    required_evidence: [],
    captured_evidence: [],
    missing_evidence: [],
  });

  const selectedAreaLabel = useMemo(() => {
    return areaOptions.find((a) => a.value === form.damage_area_primary)?.label || "Damage";
  }, [form.damage_area_primary]);

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [intake, templates] = await Promise.all([
        api.get(`/technicians/jobs/${jobId}/damage-intake`).catch(() => null),
        api.get(`/technicians/evidence/templates`).catch(() => []),
      ]);

      const template =
        (templates || []).find((t: any) => t.damage_area === (intake?.damage_area_primary || "front")) ||
        (templates || [])[0];

      setForm((prev: any) => ({
        ...prev,
        ...(intake || {}),
        odometer_reading: intake?.odometer_reading || "",
        required_evidence: intake?.required_evidence?.length
          ? intake.required_evidence
          : template?.required_media_slots || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const toggleChecklist = (key: string) => {
    if (readOnly) return;
    setForm((prev: any) => ({
      ...prev,
      visible_damage: {
        ...(prev.visible_damage || {}),
        [key]: !prev.visible_damage?.[key],
      },
    }));
  };

  const toggleArea = (area: string) => {
    if (readOnly) return;
    setForm((prev: any) => {
      const current = prev.damage_areas || [];
      const next = current.includes(area)
        ? current.filter((x: string) => x !== area)
        : [...current, area];

      return {
        ...prev,
        damage_areas: next.length ? next : [prev.damage_area_primary || "front"],
      };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const required = form.required_evidence || [];
      const payload = {
        ...form,
        odometer_reading: form.odometer_reading === "" ? null : Number(form.odometer_reading),
        warning_lights_present: !!form.visible_damage?.warning_lights,
        fluid_leak_present: !!form.visible_damage?.fluid_leak,
        airbag_deployed: !!form.visible_damage?.airbag_deployed,
        tow_required: !!form.visible_damage?.not_drivable || form.drivability_status === "tow_required",
        safety_flags: {
          ...form.safety_flags,
          not_safe_until_inspected:
            !!form.visible_damage?.not_drivable ||
            !!form.visible_damage?.fluid_leak ||
            !!form.visible_damage?.airbag_deployed,
        },
        required_evidence: required,
      };

      await api.put(`/technicians/jobs/${jobId}/damage-intake`, payload);
      await load();
      onSaved?.();
    } catch (err: any) {
      alert(err?.message || "Failed to save damage intake.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-card-dark">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">LMG Evidence Intake</p>
          <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">Damage Intake</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Capture technician observations before AI estimate generation.
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Intake
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="text-sm font-semibold">
          Incident type
          <select
            disabled={readOnly}
            value={form.incident_type || "collision"}
            onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="collision">Collision</option>
            <option value="wear_and_tear">Wear and tear</option>
            <option value="maintenance">Maintenance</option>
            <option value="mechanical">Mechanical</option>
            <option value="inspection">Inspection</option>
          </select>
        </label>

        <label className="text-sm font-semibold">
          Primary damage area
          <select
            disabled={readOnly}
            value={form.damage_area_primary || "front"}
            onChange={(e) =>
              setForm({
                ...form,
                damage_area_primary: e.target.value,
                damage_areas: Array.from(new Set([...(form.damage_areas || []), e.target.value])),
              })
            }
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {areaOptions.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          Drivability
          <select
            disabled={readOnly}
            value={form.drivability_status || "unknown"}
            onChange={(e) => setForm({ ...form, drivability_status: e.target.value })}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="unknown">Unknown</option>
            <option value="drivable">Drivable</option>
            <option value="drivable_with_caution">Drivable with caution</option>
            <option value="not_drivable">Not drivable</option>
            <option value="tow_required">Tow required</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold">
        Incident description
        <textarea
          disabled={readOnly}
          value={form.incident_description || ""}
          onChange={(e) => setForm({ ...form, incident_description: e.target.value })}
          placeholder="What happened? Where is the damage? What should the AI pay attention to?"
          className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        />
      </label>

      <div className="mt-5">
        <p className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-500">
          Visible damage checklist · {selectedAreaLabel}
        </p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {checklist.map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={readOnly}
              onClick={() => toggleChecklist(key)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
                form.visible_damage?.[key]
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              }`}
            >
              {form.visible_damage?.[key] ? <CheckCircle2 size={16} /> : <span className="h-4 w-4 rounded-full border border-zinc-400" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-500">Affected areas</p>
        <div className="flex flex-wrap gap-2">
          {areaOptions.map((area) => (
            <button
              key={area.value}
              type="button"
              disabled={readOnly}
              onClick={() => toggleArea(area.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                (form.damage_areas || []).includes(area.value)
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-zinc-200 text-zinc-500 dark:border-zinc-800"
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block text-sm font-semibold">
        Technician notes
        <textarea
          disabled={readOnly}
          value={form.technician_notes || ""}
          onChange={(e) => setForm({ ...form, technician_notes: e.target.value })}
          placeholder="Mention hidden damage risks, loose brackets, wiring, noise, alignment, warning lights, or anything the photo may not show."
          className="mt-2 min-h-28 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        />
      </label>

      {(form.visible_damage?.fluid_leak || form.visible_damage?.not_drivable || form.visible_damage?.airbag_deployed) && (
        <div className="mt-5 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          <ShieldAlert className="shrink-0" size={18} />
          <p>
            Safety risk captured. Vehicle should not proceed without manual inspection and approval.
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-300">
        <AlertTriangle className="shrink-0" size={18} />
        <p>
          This intake becomes part of the AI evidence package and should improve estimate accuracy.
        </p>
      </div>
    </section>
  );
}
