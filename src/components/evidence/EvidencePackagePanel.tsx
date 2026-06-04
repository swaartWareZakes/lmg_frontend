"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";
import { api } from "@/lib/api";

type Props = {
  jobId: string;
  readOnly?: boolean;
};

const mediaTypes = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio note" },
  { value: "document", label: "Document" },
];

const angles = [
  "front",
  "front_left",
  "front_right",
  "rear",
  "rear_left",
  "rear_right",
  "left_side",
  "right_side",
  "close_up",
  "wide",
  "undercarriage",
  "engine_bay",
  "interior",
  "other",
];

export default function EvidencePackagePanel({ jobId, readOnly = false }: Props) {
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState("photo");
  const [damageArea, setDamageArea] = useState("front");
  const [captureAngle, setCaptureAngle] = useState("front");
  const [caption, setCaption] = useState("");
  const [requiredSlotKey, setRequiredSlotKey] = useState("");

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await api.get(`/technicians/jobs/${jobId}/evidence-package`);
      setPack(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const media = pack?.media || [];
  const intake = pack?.damage_intake || null;
  const required = intake?.required_evidence || [];

  const capturedKeys = useMemo(() => {
    return new Set(media.map((m: any) => m.required_slot_key).filter(Boolean));
  }, [media]);

  const readiness = Number(
    intake?.ai_readiness_score ||
      pack?.job?.evidence_completeness_score ||
      0
  );

  const upload = async () => {
    if (!file) {
      alert("Choose a file first.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("media_type", mediaType);
      form.append("evidence_role", mediaType === "photo" ? "damage" : "walkaround");
      form.append("damage_area", damageArea);
      form.append("capture_angle", captureAngle);
      form.append("required_slot_key", requiredSlotKey);
      form.append("caption", caption);
      form.append("storage_tier", mediaType === "video" ? "cold" : "hot");

      await api.postForm(`/technicians/jobs/${jobId}/media`, form);

      setFile(null);
      setCaption("");
      setRequiredSlotKey("");
      await load();
    } catch (err: any) {
      alert(err?.message || "Evidence upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-card-dark">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-brand-primary" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Evidence Package</p>
          <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">Photos, Video & Voice Notes</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Store all evidence for AI analysis and admin review.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold dark:border-zinc-800"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
          <span>Evidence readiness</span>
          <span>{readiness}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-brand-primary"
            style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
          />
        </div>
      </div>

      {required.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-500">Required capture checklist</p>
          <div className="grid gap-2 md:grid-cols-2">
            {required.map((item: any) => {
              const done = capturedKeys.has(item.key);
              return (
                <div
                  key={item.key}
                  className={`rounded-xl border p-3 text-sm ${
                    done
                      ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                  }`}
                >
                  <p className="font-bold">{done ? "✓ " : ""}{item.label || item.key}</p>
                  <p className="mt-1 text-xs opacity-70">{item.media_type || "photo"} {item.required ? "· required" : "· optional"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="mb-5 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <div className="grid gap-3 lg:grid-cols-5">
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              {mediaTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>

            <select value={damageArea} onChange={(e) => setDamageArea(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <option value="front">Front</option>
              <option value="rear">Rear</option>
              <option value="side">Side</option>
              <option value="suspension">Suspension</option>
              <option value="interior">Interior</option>
              <option value="other">Other</option>
            </select>

            <select value={captureAngle} onChange={(e) => setCaptureAngle(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              {angles.map((angle) => <option key={angle} value={angle}>{angle.replaceAll("_", " ")}</option>)}
            </select>

            <select value={requiredSlotKey} onChange={(e) => setRequiredSlotKey(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <option value="">No checklist slot</option>
              {required.map((item: any) => (
                <option key={item.key} value={item.key}>{item.label || item.key}</option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption or spoken observation summary..."
            className="mt-3 min-h-20 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />

          <button
            onClick={upload}
            disabled={uploading}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            Upload Evidence
          </button>
        </div>
      )}

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800">
          No evidence uploaded yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {media.map((item: any) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex h-36 items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                {item.media_type === "photo" && item.signed_url ? (
                  <img src={item.signed_url} alt={item.caption || "Evidence"} className="h-full w-full object-cover" />
                ) : item.media_type === "video" ? (
                  <FileVideo className="text-brand-primary" size={34} />
                ) : item.media_type === "audio" ? (
                  <FileAudio className="text-brand-primary" size={34} />
                ) : (
                  <ImageIcon className="text-zinc-400" size={34} />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-black uppercase tracking-wider text-brand-primary">{item.media_type}</p>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">{item.capture_angle || item.damage_area || "Evidence"}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{item.caption || item.file_name || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
