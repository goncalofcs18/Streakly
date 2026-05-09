"use client";

import { useEffect, useState } from "react";
import { api, Habit, HabitCreate } from "@/lib/api";
import clsx from "clsx";

const COLORS = ["#f94516", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const ICONS = ["⚡", "🏃", "📚", "💧", "🧘", "💪", "🎸", "✍️", "🛌", "🍎", "🧹", "💻"];

const EMPTY: HabitCreate = { name: "", description: "", color: "#f94516", icon: "⚡", frequency: "daily" };

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [form, setForm] = useState<HabitCreate>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.habits.list().then((data) => { setHabits(data); setLoading(false); });
  }, []);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await api.habits.update(editId, form);
        setHabits((prev) => prev.map((h) => (h.id === editId ? updated : h)));
        setEditId(null);
      } else {
        const created = await api.habits.create(form);
        setHabits((prev) => [created, ...prev]);
      }
      setForm(EMPTY);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(h: Habit) {
    setEditId(h.id);
    setForm({ name: h.name, description: h.description || "", color: h.color, icon: h.icon, frequency: h.frequency });
  }

  async function remove(id: string) {
    if (!confirm("Delete this habit and all its logs?")) return;
    await api.habits.delete(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Manage habits</h1>
        <p className="text-coal-300 mt-1 text-sm">Create and edit your daily habits.</p>
      </div>

      {/* Form */}
      <div className="card space-y-5">
        <h2 className="font-display font-semibold text-lg text-white">
          {editId ? "Edit habit" : "New habit"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-coal-300 font-mono mb-1.5">Name</label>
            <input
              className="input"
              placeholder="e.g. Morning run"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-coal-300 font-mono mb-1.5">Description (optional)</label>
            <input
              className="input"
              placeholder="e.g. 30 minutes before breakfast"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-coal-300 font-mono mb-1.5">Frequency</label>
            <select
              className="input"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-coal-300 font-mono mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={clsx(
                    "w-9 h-9 rounded-lg text-lg transition-all",
                    form.icon === ic
                      ? "bg-coal-600 scale-110 ring-2 ring-flame-500"
                      : "bg-coal-700 hover:bg-coal-600"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-coal-300 font-mono mb-1.5">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={clsx(
                    "w-8 h-8 rounded-lg transition-all",
                    form.color === c ? "scale-125 ring-2 ring-white/40" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary">
            {saving ? "Saving…" : editId ? "Save changes" : "Create habit"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(EMPTY); }} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Habit list */}
      {loading ? (
        <p className="text-coal-300 font-mono text-sm animate-pulse">Loading…</p>
      ) : habits.length === 0 ? (
        <p className="text-coal-300 text-sm">No habits yet. Create your first one above.</p>
      ) : (
        <div className="space-y-3">
          {habits.map((h, i) => (
            <div
              key={h.id}
              className="card flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: h.color + "22", border: `1px solid ${h.color}44` }}
              >
                {h.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{h.name}</p>
                {h.description && (
                  <p className="text-xs text-coal-300 truncate">{h.description}</p>
                )}
              </div>
              <span className="badge bg-coal-700 text-coal-200">{h.frequency}</span>
              <button
                onClick={() => startEdit(h)}
                className="text-coal-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-coal-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-.707.464l-3 1 1-3a2 2 0 01.464-.707z" />
                </svg>
              </button>
              <button
                onClick={() => remove(h.id)}
                className="text-coal-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 002 2h6a2 2 0 002-2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
