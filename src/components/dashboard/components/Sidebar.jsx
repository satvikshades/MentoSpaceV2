import { Link, NavLink } from "react-router-dom";
import {
  FiSun,
  FiCheckCircle,
  FiActivity,
  FiCompass,
  FiCalendar,
  FiMessageCircle,
  FiUsers,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { logout } from "../../../lib/session";
import { Avatar } from "../../ui";

const STUDENT_NAV = [
  { to: "/dashboard", label: "Today", icon: FiSun, end: true },
  { to: "/dashboard/habits", label: "Habits", icon: FiCheckCircle },
  { to: "/dashboard/mood", label: "Mood journal", icon: FiActivity },
  { to: "/dashboard/find-mentor", label: "Mentors", icon: FiCompass },
  { to: "/dashboard/sessions", label: "Sessions", icon: FiCalendar },
  { to: "/dashboard/chats", label: "Messages", icon: FiMessageCircle },
];

const MENTOR_NAV = [
  { to: "/dashboard", label: "Today", icon: FiSun, end: true },
  { to: "/dashboard/my-students", label: "Students", icon: FiUsers, badge: true },
  { to: "/dashboard/sessions", label: "Sessions", icon: FiCalendar },
  { to: "/dashboard/chats", label: "Messages", icon: FiMessageCircle },
];

function Item({ to, label, icon, end, count }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
          isActive ? "bg-primary-50 text-primary" : "text-ink/70 hover:bg-bg-light-gray hover:text-ink"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </NavLink>
  );
}

function Sidebar({ role, profile, pending = 0 }) {
  const nav = role === "mentor" ? MENTOR_NAV : STUDENT_NAV;

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link to="/" className="mb-8 px-3">
        <span className="wordmark text-[22px]">
          MentoSpace<span className="text-secondary">.</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {nav.map((n) => (
          <Item key={n.to} {...n} count={n.badge ? pending : 0} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-line pt-4">
        <Item to="/dashboard/settings" label="Settings" icon={FiSettings} />
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink/70 transition hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut className="h-[18px] w-[18px]" /> Log out
        </button>

        {profile && (
          <Link
            to="/dashboard/profile"
            className="mt-3 flex items-center gap-3 rounded-xl p-2 transition hover:bg-bg-light-gray"
          >
            <Avatar person={profile} size={38} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{profile.name || "You"}</p>
              <p className="text-xs capitalize text-muted">{profile.role || "student"}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
