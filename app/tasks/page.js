"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Tasks() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Todo");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchTasks = async (userId) => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);
      await fetchTasks(user.id);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("Todo");
    setEditingTaskId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    if (editingTaskId) {
      const { error } = await supabase
        .from("tasks")
        .update({
          title,
          description,
          status,
          due_date: dueDate || null,
        })
        .eq("id", editingTaskId);

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        await fetchTasks(currentUser.id);
      }
    } else {
      const { error } = await supabase.from("tasks").insert({
        user_id: currentUser.id,
        title,
        description,
        status,
        due_date: dueDate || null,
      });

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        await fetchTasks(currentUser.id);
      }
    }

    setSaving(false);
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setStatus(task.status || "Todo");
    setDueDate(task.due_date || "");
  };

  const handleDelete = async (id) => {
    if (!currentUser) return;
    setSaving(true);
    setError("");

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await fetchTasks(currentUser.id);
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    //signOut is a function to sign out the user from the database
    router.push("/login");
  };

  const visibleTasks = tasks
    .filter((task) =>
      statusFilter === "All" ? true : task.status === statusFilter
    )
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      const aDate = new Date(a.due_date);
      const bDate = new Date(b.due_date);
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Task Manager</h1>
          <div className="flex items-center gap-3 text-sm">
            {currentUser && (
              <span className="text-gray-600 truncate max-w-[160px]">
                {currentUser.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <section className="rounded-md bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-medium">
            {editingTaskId ? "Edit Task" : "Create Task"}
          </h2>

          {error && (
            <p className="mb-3 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Title
              </label>
              <input
                className="w-full rounded border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Due date
                </label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={dueDate || ""}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {editingTaskId
                    ? saving
                      ? "Saving..."
                      : "Update Task"
                    : saving
                    ? "Creating..."
                    : "Create Task"}
                </button>
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-md bg-white p-4 shadow">
          <div className="mb-3 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-medium">Your Tasks</h2>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="mr-2 text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="mr-2 text-xs font-medium text-gray-700">
                  Sort by due date
                </label>
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Oldest first</option>
                  <option value="desc">Newest first</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600">Loading tasks...</p>
          ) : visibleTasks.length === 0 ? (
            <p className="text-sm text-gray-600">
              No tasks yet. Create your first task above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTasks.map((task) => (
                    <tr key={task.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="rounded-full bg-gray-100 px-2 py-1">
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="rounded border px-2 py-1 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}