"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api";
import DamageIntakeForm from "@/components/evidence/DamageIntakeForm";
import EvidencePackagePanel from "@/components/evidence/EvidencePackagePanel";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/jobs/${jobId}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  const saveComment = async () => {
    if (!comment.trim()) return;

    setSaving(true);
    try {
      await api.post(`/admin/jobs/${jobId}/comments`, {
        comment,
        comment_type: "admin",
        visibility: "public",
      });
      setComment("");
      await fetchJob();
    } catch (err: any) {
      alert(err?.message || "Failed to save comment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const job = data?.job || {};
  const vehicle = job?.vehicles || {};
  const technician = job?.profiles || {};
  const selectedEstimate = job?.selected_estimate || null;
  const approvedEstimate = job?.approved_estimate || null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/dashboard/admin/jobs"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-brand-primary"
        >
          <ArrowLeft size={16} /> Back to admin jobs
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">
            Admin Job Detail
          </p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
            {job.title || "Untitled job"}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {vehicle.make} {vehicle.model} · {vehicle.license_plate || vehicle.vin || "No plate"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Info title="Status" value={job.status} />
            <Info title="Technician" value={technician.full_name || "Unassigned"} />
            <Info title="Parts" value={job.parts_status || "not_required"} />
            <Info title="Selected" value={currency(job.selected_estimate_total || selectedEstimate?.total_estimate)} />
            <Info title="Approved" value={currency(approvedEstimate?.total_estimate)} />
          </div>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reported issue</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {job.reported_issue || "No reported issue captured."}
            </p>
          </div>
        </div>
      </div>


      <div className="grid gap-5 xl:grid-cols-2">
        <DamageIntakeForm jobId={jobId} readOnly />
        <EvidencePackagePanel jobId={jobId} readOnly />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
          <h2 className="mb-4 text-lg font-black">Photos & Estimates</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info title="Estimates" value={(data?.estimates || []).length} />
            <Info title="Photos" value={(data?.photos || []).length} />
            <Info title="Approval Requests" value={(data?.approval_requests || []).length} />
            <Info title="Actual Cost Records" value={(data?.actual_costs || []).length} />
          </div>

          <div className="mt-5 space-y-3">
            {(data?.estimates || []).slice(0, 4).map((estimate: any) => (
              <div key={estimate.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{estimate.source}</p>
                  <p className="font-mono font-black text-brand-primary">{currency(estimate.total_estimate)}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{estimate.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <MessageSquare size={18} className="text-brand-primary" /> Admin Comments
          </h2>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add admin comment, approval note, parts note or internal instruction..."
            className="min-h-28 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-zinc-950"
          />

          <button
            onClick={saveComment}
            disabled={saving || !comment.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Save Comment
          </button>

          <div className="mt-5 space-y-3">
            {(data?.comments || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
                No admin comments yet.
              </div>
            ) : (
              data.comments.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-bold">{item.profiles?.full_name || "Admin"}</p>
                    <span className="text-xs text-zinc-500">{item.visibility}</span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 font-black text-zinc-950 dark:text-white">{value || "-"}</p>
    </div>
  );
}
