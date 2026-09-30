"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type AssignableUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: "internal" | "external" | null;
};

type Assignment = {
  id: string;
  user_id: string;
  created_at: string;
};

type Props = {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  adminId: string | null;
};

function displayName(u: AssignableUser | undefined) {
  if (!u) return "Unknown user";
  return u.full_name || u.email || "Unnamed user";
}

export default function LessonAssignmentsPanel({
  courseId,
  lessonId,
  lessonTitle,
  adminId,
}: Props) {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [audience, setAudience] = useState<"internal" | "external" | "both" | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ---------- LOAD USERS + COURSE AUDIENCE (once per course) ----------
  useEffect(() => {
    const loadUsers = async () => {
      const [{ data: userRows, error: usersError }, { data: courseRow }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, email, user_type")
            .or("role.is.null,role.neq.admin")
            .order("full_name", { ascending: true }),
          supabase.from("courses").select("audience").eq("id", courseId).maybeSingle(),
        ]);

      if (usersError) console.error("Error loading users:", usersError);
      setUsers((userRows || []) as AssignableUser[]);
      setAudience((courseRow?.audience as typeof audience) ?? null);
    };

    loadUsers();
  }, [courseId]);

  // ---------- LOAD ASSIGNMENTS FOR THIS LESSON ----------
  const loadAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from("lesson_assignments")
      .select("id, user_id, created_at")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading lesson assignments:", error);
      setMessage("Error loading assignments. Has the lesson_assignments migration been run?");
      setAssignments([]);
    } else {
      setAssignments((data || []) as Assignment[]);
    }
    setLoading(false);
  }, [lessonId]);

  // Parent renders this panel with key={lessonId}, so state resets per lesson.
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // ---------- HANDLERS ----------
  const handleAssign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const user = users.find((u) => u.id === selectedUserId);
    if (!user) {
      setMessage("Please select a learner from the list.");
      return;
    }

    if (assignments.some((a) => a.user_id === user.id)) {
      setMessage(`${displayName(user)} is already assigned this lesson.`);
      return;
    }

    if (audience === "internal" && user.user_type === "external") {
      setMessage("This course is internal only and can’t be assigned to an external learner.");
      return;
    }
    if (audience === "external" && user.user_type === "internal") {
      setMessage(
        "This course is targeted to external learners. Change the audience to 'both' to include internal learners."
      );
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("lesson_assignments").insert({
      lesson_id: lessonId,
      user_id: user.id,
      assigned_by: adminId,
    });
    setSaving(false);

    if (error) {
      console.error("Error assigning lesson:", error);
      setMessage(`Error assigning lesson: ${error.message}`);
      return;
    }

    setMessage(`Lesson assigned to ${displayName(user)}.`);
    setSelectedUserId("");
    loadAssignments();
  };

  const handleUnassign = async (assignment: Assignment) => {
    const user = users.find((u) => u.id === assignment.user_id);
    const confirmed = window.confirm(`Remove this lesson from ${displayName(user)}?`);
    if (!confirmed) return;

    setSaving(true);
    const { error } = await supabase
      .from("lesson_assignments")
      .delete()
      .eq("id", assignment.id);
    setSaving(false);

    if (error) {
      console.error("Error removing assignment:", error);
      setMessage(`Error removing assignment: ${error.message}`);
      return;
    }

    setMessage("Assignment removed.");
    loadAssignments();
  };

  const assignedIds = new Set(assignments.map((a) => a.user_id));
  const availableUsers = users.filter((u) => !assignedIds.has(u.id));

  // ---------- RENDER ----------
  return (
    <div className="block">
      <div className="block-header">
        <div className="block-title">Lesson Assignments</div>
      </div>
      <p className="small-block-text">
        Assign <strong>{lessonTitle}</strong> to specific learners. It will appear under
        “Assigned to you” on their dashboard.
      </p>

      <form
        onSubmit={handleAssign}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
      >
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{
            flex: "1 1 180px",
            minWidth: 0,
            padding: "6px 8px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            fontSize: 12,
          }}
        >
          <option value="">Select a learner…</option>
          {availableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {displayName(u)}
              {u.user_type ? ` (${u.user_type})` : ""}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={saving || !selectedUserId}>
          Assign
        </button>
      </form>

      {message && (
        <p
          style={{
            marginBottom: 12,
            fontSize: 12,
            color:
              message.toLowerCase().includes("error") ||
              message.toLowerCase().includes("can’t") ||
              message.toLowerCase().includes("already")
                ? "#b91c1c"
                : "#047857",
          }}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="small-block-text">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="small-block-text">No one has been assigned this lesson yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {assignments.map((a) => {
            const user = users.find((u) => u.id === a.user_id);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              >
                <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  <div style={{ fontWeight: 600 }}>{displayName(user)}</div>
                  <div style={{ color: "#6b7280" }}>
                    {user?.email ?? ""} · assigned{" "}
                    {new Date(a.created_at).toLocaleDateString("en-US")}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => handleUnassign(a)}
                  style={{ fontSize: 11, padding: "4px 10px" }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
