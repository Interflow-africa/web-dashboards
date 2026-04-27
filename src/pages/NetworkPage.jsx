import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import {
  artistAPI,
  connectionsAPI,
  opportunitiesAPI,
  applicationsAPI,
} from "../services/api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

// ─── Network Page ─────────────────────────────────────────────────
export const NetworkPage = () => {
  const [tab, setTab] = useState("discover");
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [connected, setConnected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      connectionsAPI.discover(),
      connectionsAPI.getMyConnections(),
      connectionsAPI.getIncoming(),
    ])
      .then(([d, c, i]) => {
        setUsers(d.data.data || []);
        setConnections(c.data.data || []);
        setIncoming(i.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (id) => {
    try {
      await connectionsAPI.send({ receiver_id: id });
      setConnected((s) => new Set([...s, id]));
      toast.success("Request sent!");
    } catch {
      toast.error("Could not send request");
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await connectionsAPI.respond(id, { action });
      if (action === "accept") {
        toast.success("Connection accepted!");
        setIncoming((i) => i.filter((x) => x.id !== id));
      } else {
        setIncoming((i) => i.filter((x) => x.id !== id));
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const tabs = [
    { key: "discover", label: `Discover` },
    { key: "connections", label: `My Connections (${connections.length})` },
    { key: "incoming", label: `Requests (${incoming.length})` },
  ];

  return (
    <DashboardLayout>
      <div className="dash-page-header">
        <h1 className="dash-page-title">My Network</h1>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: tab === t.key ? "600" : "400",
              color: tab === t.key ? "var(--gold)" : "var(--text-muted)",
              borderBottom: `2px solid ${tab === t.key ? "var(--gold)" : "transparent"}`,
              background: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all var(--transition)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          {tab === "discover" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
                gap: "16px",
              }}
            >
              {users.map((u) => {
                const name = u.display_name || u.email;
                const init = name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={u.id}
                    className="section-card"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "var(--gold)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "700",
                        margin: "0 auto 12px",
                      }}
                    >
                      {init}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "var(--dark)",
                        marginBottom: "4px",
                      }}
                    >
                      {name}
                    </div>
                    <div
                      className="badge badge-grey"
                      style={{ marginBottom: "14px", display: "inline-block" }}
                    >
                      {u.role}
                    </div>
                    <button
                      className={`btn btn-sm ${connected.has(u.id) ? "btn-outline" : "btn-primary"}`}
                      style={{ width: "100%" }}
                      onClick={() =>
                        !connected.has(u.id) && handleConnect(u.id)
                      }
                      disabled={connected.has(u.id)}
                    >
                      {connected.has(u.id) ? "✓ Sent" : "+ Connect"}
                    </button>
                  </div>
                );
              })}
              {users.length === 0 && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "60px",
                    color: "var(--text-muted)",
                  }}
                >
                  No new users to discover right now.
                </div>
              )}
            </div>
          )}

          {tab === "connections" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
                gap: "16px",
              }}
            >
              {connections.map((c) => {
                const other =
                  c.sender.id === c.receiver.id ? c.receiver : c.sender;
                const init = (other.display_name || other.email)
                  .charAt(0)
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    className="section-card"
                    style={{
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "var(--gold)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {init}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--dark)",
                        }}
                      >
                        {other.display_name || other.email}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        {other.role}
                      </div>
                    </div>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "60px",
                    color: "var(--text-muted)",
                  }}
                >
                  No connections yet. Start connecting!
                </div>
              )}
            </div>
          )}

          {tab === "incoming" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {incoming.map((c) => {
                const sender = c.sender;
                const init = (sender.display_name || sender.email)
                  .charAt(0)
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    className="section-card"
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "var(--gold)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {init}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--dark)",
                        }}
                      >
                        {sender.display_name || sender.email}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        {sender.role} · wants to connect
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRespond(c.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRespond(c.id, "decline")}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
              {incoming.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "var(--text-muted)",
                  }}
                >
                  No pending connection requests.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default NetworkPage;