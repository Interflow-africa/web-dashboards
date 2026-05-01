import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { connectionsAPI } from "../services/api";
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
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">My Network</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-[#F0F0F0] pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="pb-2.5 px-5 text-[14px] transition-all"
            style={{
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#8D5D1D" : "#AAAAAA",
              borderBottom: `2px solid ${tab === t.key ? "#8D5D1D" : "transparent"}`,
              background: "none",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#AAAAAA]">Loading...</div>
      ) : (
        <>
          {tab === "discover" && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
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
                    className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-5 text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold mx-auto mb-3"
                      style={{ background: "#8D5D1D" }}
                    >
                      {init}
                    </div>
                    <div className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                      {name}
                    </div>
                    <span
                      className="text-[11px] bg-[#F0F0F0] text-[#666] px-2.5 py-0.5 rounded-full inline-block mb-3.5"
                    >
                      {u.role}
                    </span>
                    <button
                      className={`w-full text-[12px] font-semibold px-4 py-1.5 rounded-full transition-colors ${
                        connected.has(u.id)
                          ? "border border-[#E0E0E0] text-[#444] hover:bg-[#F5F5F5]"
                          : "bg-[#8D5D1D] text-white hover:bg-[#7A5210]"
                      }`}
                      onClick={() => !connected.has(u.id) && handleConnect(u.id)}
                      disabled={connected.has(u.id)}
                    >
                      {connected.has(u.id) ? "✓ Sent" : "+ Connect"}
                    </button>
                  </div>
                );
              })}
              {users.length === 0 && (
                <div className="col-span-full text-center py-16 text-[#AAAAAA]">
                  No new users to discover right now.
                </div>
              )}
            </div>
          )}

          {tab === "connections" && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))" }}>
              {connections.map((c) => {
                const other =
                  c.sender.id === c.receiver.id ? c.receiver : c.sender;
                const init = (other.display_name || other.email)
                  .charAt(0)
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-5 flex items-center gap-3.5"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: "#8D5D1D" }}
                    >
                      {init}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-[#1A1A1A]">
                        {other.display_name || other.email}
                      </div>
                      <div className="text-[12px] text-[#AAAAAA]">
                        {other.role}
                      </div>
                    </div>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <div className="col-span-full text-center py-16 text-[#AAAAAA]">
                  No connections yet. Start connecting!
                </div>
              )}
            </div>
          )}

          {tab === "incoming" && (
            <div className="flex flex-col gap-3">
              {incoming.map((c) => {
                const sender = c.sender;
                const init = (sender.display_name || sender.email)
                  .charAt(0)
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] px-5 py-4.5 flex items-center gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: "#8D5D1D" }}
                    >
                      {init}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-[#1A1A1A]">
                        {sender.display_name || sender.email}
                      </div>
                      <div className="text-[12px] text-[#AAAAAA]">
                        {sender.role} · wants to connect
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-[#8D5D1D] text-white text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-[#7A5210] transition-colors"
                        onClick={() => handleRespond(c.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="border border-[#E0E0E0] text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-[#F5F5F5] transition-colors text-[#444]"
                        onClick={() => handleRespond(c.id, "decline")}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
              {incoming.length === 0 && (
                <div className="text-center py-16 text-[#AAAAAA]">
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
