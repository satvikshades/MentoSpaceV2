import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiArchive, FiCopy, FiDownload, FiInbox, FiMail, FiTrash2 } from "react-icons/fi";
import { deleteMessage, downloadCSV, setMessageStatus } from "../../lib/admin";
import { topicLabel } from "../../lib/contact";
import { planByKey } from "../../lib/plans";
import { timeAgo, toDate } from "../../lib/progress";
import { Confirm, Drawer, Empty, Filter, GoldAvatar, Pill, SearchBox, SectionTitle, Stat } from "./AdminUI";

const STATUS = {
  new: ["gold", "New"],
  read: ["grey", "Read"],
  replied: ["green", "Replied"],
  archived: ["grey", "Archived"],
};

const fullDate = (v) =>
  toDate(v)?.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) || "—";

function StatusPill({ status }) {
  const [tone, label] = STATUS[status] || STATUS.read;
  return <Pill tone={tone}>{label}</Pill>;
}

function PlanPill({ plan }) {
  const p = planByKey[plan];
  return p ? <Pill tone="violet">{p.name}</Pill> : null;
}

function replyLink(m) {
  const subject = `Re: your MentoSpace enquiry${m.organisation ? ` (${m.organisation})` : ""}`;
  const when = fullDate(m.createdAt);
  const quoted = m.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const body = `Hi ${m.name.split(" ")[0]},\n\nThank you for getting in touch with MentoSpace.\n\n\n\nOn ${when}, ${m.name} wrote:\n${quoted}`;
  return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function MessageDrawer({ message: m, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!m) return null;
  const plan = planByKey[m.plan];

  const change = async (status, note) => {
    try {
      await setMessageStatus(m, status);
      if (note) toast.success(note);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update. Check the Firestore rules are published.");
    }
  };

  return (
    <Drawer open onClose={onClose} title="Message">
      <div className="flex items-center gap-4">
        <GoldAvatar person={{ name: m.name }} size={56} />
        <div className="min-w-0">
          <h2 className="truncate font-serif text-3xl">{m.name}</h2>
          <p className="truncate text-sm text-sand">{m.organisation || topicLabel(m.topic)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <StatusPill status={m.status} />
        <Pill tone="grey">{topicLabel(m.topic)}</Pill>
        <PlanPill plan={m.plan} />
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-sand">Email</dt>
          <dd className="mt-1 flex items-center gap-2">
            <a href={`mailto:${m.email}`} className="truncate text-champagne hover:text-gold-light">{m.email}</a>
            <button
              onClick={() => navigator.clipboard?.writeText(m.email).then(() => toast.success("Email copied"))}
              className="shrink-0 text-sand hover:text-gold-light"
              aria-label="Copy email"
            >
              <FiCopy />
            </button>
          </dd>
        </div>
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-sand">Phone</dt>
          <dd className="mt-1 truncate">
            {m.phone ? <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="text-champagne hover:text-gold-light">{m.phone}</a> : <span className="text-sand">—</span>}
          </dd>
        </div>
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-sand">Students</dt>
          <dd className="mt-1">{m.students || <span className="text-sand">—</span>}</dd>
        </div>
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-sand">Plan of interest</dt>
          <dd className="mt-1">
            {plan ? (
              plan.name
            ) : (
              <span className="text-sand">Not sure yet</span>
            )}
          </dd>
        </div>
      </dl>

      <section className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sand">Received {fullDate(m.createdAt)}</p>
        <div className="mt-2 whitespace-pre-wrap break-words rounded-2xl bg-onyx p-5 text-[15px] leading-relaxed text-champagne ring-1 ring-gold-line">
          {m.message}
        </div>
        {m.statusBy && (
          <p className="mt-2 text-xs text-sand">
            Marked {STATUS[m.status]?.[1]?.toLowerCase() || m.status} by {m.statusBy} · {timeAgo(m.statusAt)}
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-2 border-t border-gold-line pt-6 sm:grid-cols-2">
        <a href={replyLink(m)} onClick={() => m.status !== "replied" && change("replied")} className="gold-btn sm:col-span-2">
          <FiMail /> Reply by email
        </a>
        {m.status !== "replied" && (
          <button onClick={() => change("replied", "Marked as replied")} className="gold-ghost">
            Mark as replied
          </button>
        )}
        {m.status !== "new" && (
          <button onClick={() => change("new", "Marked as new")} className="gold-ghost">
            Mark as new
          </button>
        )}
        {m.status === "archived" ? (
          <button onClick={() => change("read", "Moved to inbox")} className="gold-ghost">
            <FiInbox /> Move to inbox
          </button>
        ) : (
          <button
            onClick={() => {
              change("archived", "Archived");
              onClose();
            }}
            className="gold-ghost"
          >
            <FiArchive /> Archive
          </button>
        )}
        <button onClick={() => setConfirmDelete(true)} className="gold-danger">
          <FiTrash2 /> Delete
        </button>
      </section>

      <Confirm
        open={confirmDelete}
        title={`Delete the message from ${m.name}?`}
        body="It's removed for good. Archive it instead if you might need it later."
        confirmLabel="Delete message"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async (reason) => {
          try {
            await deleteMessage(m, reason);
            toast.success("Message deleted");
            setConfirmDelete(false);
            onClose();
          } catch (err) {
            console.error(err);
            toast.error("Couldn't delete the message.");
          }
        }}
      />
    </Drawer>
  );
}

export function MessagesSection({ messages, messagesError }) {
  const [view, setView] = useState("inbox");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);

  const list = useMemo(() => messages || [], [messages]);
  const counts = useMemo(() => {
    const c = { new: 0, replied: 0, archived: 0, week: 0 };
    const weekAgo = Date.now() - 7 * 86400000;
    list.forEach((m) => {
      if (c[m.status] !== undefined) c[m.status] += 1;
      if ((toDate(m.createdAt)?.getTime() || 0) > weekAgo) c.week += 1;
    });
    return c;
  }, [list]);

  const rows = list.filter((m) => {
    if (view === "inbox" && m.status === "archived") return false;
    if (view !== "inbox" && view !== "all" && m.status !== view) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${m.name} ${m.email} ${m.organisation} ${m.message} ${m.phone}`.toLowerCase().includes(needle);
  });

  const open = list.find((m) => m.id === openId);

  const openMessage = (m) => {
    setOpenId(m.id);
    if (m.status === "new") setMessageStatus(m, "read").catch(() => {});
  };

  const exportAll = () =>
    downloadCSV(
      `mentospace-messages-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((m) => ({
        received: toDate(m.createdAt)?.toISOString() || "",
        status: m.status,
        topic: topicLabel(m.topic),
        name: m.name,
        email: m.email,
        phone: m.phone,
        institution: m.organisation,
        students: m.students,
        plan: planByKey[m.plan]?.name || "",
        message: m.message,
      }))
    );

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Messages"
        title="Enquiries from the website"
        sub="Everything sent through the Contact us page. A copy of each one is also emailed to permanentwofliving@gmail.com. New messages appear here live."
        action={
          list.length > 0 && (
            <button onClick={exportAll} className="gold-ghost">
              <FiDownload /> Export
            </button>
          )
        }
      />

      {messagesError && (
        <Empty>Messages couldn't be read. Publish the updated firestore.rules so the admin can read contact_messages.</Empty>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="New" value={counts.new} hint="Not opened yet" tone={counts.new ? "alert" : undefined} />
        <Stat label="Last 7 days" value={counts.week} hint="Messages received" />
        <Stat label="Replied" value={counts.replied} hint={`${list.length} in total`} />
        <Stat label="Pilot requests" value={list.filter((m) => m.topic === "pilot").length} hint={`${list.filter((m) => m.plan).length} named a plan`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Filter
          value={view}
          onChange={setView}
          options={[
            ["inbox", "Inbox"],
            ["new", `New${counts.new ? ` · ${counts.new}` : ""}`],
            ["replied", "Replied"],
            ["archived", "Archived"],
            ["all", "All"],
          ]}
        />
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, school…" />
      </div>

      {messages === null ? (
        <div className="py-10 text-center text-sm text-sand">Loading messages…</div>
      ) : rows.length === 0 ? (
        <Empty>
          {list.length === 0
            ? "No messages yet. When someone uses the Contact us page, it will show up here straight away."
            : "Nothing matches this filter."}
        </Empty>
      ) : (
        <ul className="gold-panel divide-y divide-gold-line overflow-hidden">
          {rows.map((m) => {
            const unread = m.status === "new";
            return (
              <li key={m.id}>
                <button
                  onClick={() => openMessage(m)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-onyx-3 sm:px-5 ${unread ? "bg-gold/[0.04]" : ""}`}
                >
                  <span className={`mt-3 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-gold" : "bg-transparent"}`} aria-hidden="true" />
                  <GoldAvatar person={{ name: m.name }} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className={`truncate text-sm ${unread ? "font-bold text-champagne" : "font-semibold text-champagne/90"}`}>{m.name}</p>
                      {m.organisation && <p className="truncate text-xs text-sand">· {m.organisation}</p>}
                    </div>
                    <p className={`mt-0.5 line-clamp-2 text-sm ${unread ? "text-champagne/90" : "text-sand"}`}>{m.message}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill tone="grey">{topicLabel(m.topic)}</Pill>
                      <PlanPill plan={m.plan} />
                      {m.status !== "new" && <StatusPill status={m.status} />}
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-sand">{timeAgo(m.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && <MessageDrawer key={open.id} message={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

