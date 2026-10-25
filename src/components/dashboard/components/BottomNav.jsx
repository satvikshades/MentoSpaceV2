import { NavLink } from "react-router-dom";
import { FiSun, FiCheckCircle, FiCompass, FiMessageCircle, FiUser, FiUsers, FiCalendar } from "react-icons/fi";

const STUDENT = [
  { to: "/dashboard", label: "Today", icon: FiSun, end: true },
  { to: "/dashboard/habits", label: "Habits", icon: FiCheckCircle },
  { to: "/dashboard/find-mentor", label: "Mentors", icon: FiCompass },
  { to: "/dashboard/chats", label: "Messages", icon: FiMessageCircle },
  { to: "/dashboard/profile", label: "You", icon: FiUser },
];

const MENTOR = [
  { to: "/dashboard", label: "Today", icon: FiSun, end: true },
  { to: "/dashboard/my-students", label: "Students", icon: FiUsers, badge: true },
  { to: "/dashboard/sessions", label: "Sessions", icon: FiCalendar },
  { to: "/dashboard/chats", label: "Messages", icon: FiMessageCircle },
  { to: "/dashboard/profile", label: "You", icon: FiUser },
];

function BottomNav({ role, pending = 0 }) {
  const items = role === "mentor" ? MENTOR : STUDENT;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md justify-around px-2">
        {items.map(({ to, label, icon: Icon, end, badge }) => ( // eslint-disable-line no-unused-vars
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                isActive ? "text-primary" : "text-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${isActive ? "bg-primary-50" : ""}`}>
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                {label}
                {badge && pending > 0 && (
                  <span className="absolute right-[22%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {pending}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
