"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import AdminSidebar from "../../components/AdminSidebar";
import { SOP_LAST_UPDATED, SOP_SECTIONS, SopBlock } from "../../../lib/adminSop";
import { OPEN_WALKTHROUGH_EVENT } from "../../components/AdminWalkthrough";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

function SopBlockView({ block }: { block: SopBlock }) {
  return (
    <>
      {block.heading && <h3>{block.heading}</h3>}
      {block.text && <p>{block.text}</p>}
      {block.steps && (
        <ol>
          {block.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {block.bullets && (
        <ul>
          {block.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {block.rows && (
        <table className="sop-rows">
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>{r.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {block.note && <div className="sop-note">{block.note}</div>}
    </>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();

  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ MOBILE SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------- AUTH / ADMIN CHECK ----------
  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);
      setError("Could not verify your session.");
      setLoadingProfile(false);
      return;
    }

    if (!session?.user) {
      setLoadingProfile(false);
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", session.user.id)
      .single();

    if (error || !data) {
      console.error(error);
      setError("Could not load your profile.");
      setLoadingProfile(false);
      return;
    }

    if (data.role !== "admin") {
      setLoadingProfile(false);
      router.replace("/dashboard");
      return;
    }

    setAdminProfile(data as Profile);
    setLoadingProfile(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loadingProfile) {
    return <div style={{ padding: 24 }}>Loading settings…</div>;
  }

  if (!adminProfile) {
    return error ? <div style={{ padding: 24 }}>{error}</div> : null;
  }

  return (
    <div className="dashboard-root admin-root">
      {/* ✅ Sidebar (mobile dropdown capable) */}
      <AdminSidebar
        active="settings"
        fullName={adminProfile.full_name}
        email={adminProfile.email}
        isOpen={sidebarOpen}
        onNavClick={() => setSidebarOpen(false)}
      />

      {/* ✅ Overlay (tap to close) */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="main">
        <div className="topbar">
          {/* ✅ Hamburger (mobile only via CSS) */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>
            <div className="topbar-title">Settings</div>
            <div className="topbar-subtitle">
              Admin guide and standard operating procedures for Anchor Academy.
            </div>
          </div>
        </div>

        <div className="block" style={{ marginBottom: 14 }}>
          <div className="block-header">
            <div className="block-title">Admin walkthrough</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.dispatchEvent(new Event(OPEN_WALKTHROUGH_EVENT))}
            >
              Restart walkthrough
            </button>
          </div>
          <p className="small-block-text">
            A 2-minute, step-by-step tour of the Admin Console. You can also open it any time
            from the Admin guide button in the bottom right corner.
          </p>
        </div>

        <div className="block-header" id="sop" style={{ margin: "8px 0 10px" }}>
          <div className="block-title">Admin SOP</div>
          <div style={{ fontSize: 12, color: "#76777b" }}>Last updated {SOP_LAST_UPDATED}</div>
        </div>

        <div className="sop-layout">
          <nav className="block sop-toc" aria-label="SOP sections">
            <div className="block-title" style={{ marginBottom: 6 }}>
              Contents
            </div>
            {SOP_SECTIONS.map((section, idx) => (
              <a key={section.id} href={`#${section.id}`}>
                {idx + 1}. {section.title}
              </a>
            ))}
          </nav>

          <div className="sop-sections">
            {SOP_SECTIONS.map((section, idx) => (
              <section key={section.id} id={section.id} className="block sop-section">
                <h2>
                  {idx + 1}. {section.title}
                </h2>
                {section.intro && <p>{section.intro}</p>}
                {section.blocks.map((block, i) => (
                  <SopBlockView key={i} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
