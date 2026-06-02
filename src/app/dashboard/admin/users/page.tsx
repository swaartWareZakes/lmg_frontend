"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, ShieldCheck, Users } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/users");
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    `${u.full_name || ""} ${u.email || ""} ${u.role || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, enabled: boolean) => {
    try {
      await api.post(`/admin/users/${id}/${enabled ? "enable" : "disable"}`, {});
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to update user.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">Admin Users</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">Users, Roles & Workload</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Track users, role access, active status and technician job load.
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-card-dark sm:w-80"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned</th>
                  <th className="px-5 py-3">Open</th>
                  <th className="px-5 py-3">Completed</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 dark:text-white">{user.full_name || "Unnamed user"}</p>
                          <p className="text-xs text-zinc-500">{user.email || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-zinc-800">
                        <ShieldCheck size={12} /> {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">{user.status}</td>
                    <td className="px-5 py-4 font-bold">{user.job_stats?.assigned || 0}</td>
                    <td className="px-5 py-4 font-bold text-amber-500">{user.job_stats?.open || 0}</td>
                    <td className="px-5 py-4 font-bold text-emerald-500">{user.job_stats?.completed || 0}</td>
                    <td className="px-5 py-4">
                      {user.status === "disabled" ? (
                        <button onClick={() => updateStatus(user.id, true)} className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white">
                          Enable
                        </button>
                      ) : (
                        <button onClick={() => updateStatus(user.id, false)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-500">
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
