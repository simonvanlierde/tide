import { CalendarDays, House, Settings2 } from "../ui/icons";
import { HistoryScreen } from "../features/history/HistoryScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TodayScreen } from "../features/today/TodayScreen";

export const routes = [
  {
    path: "/",
    title: "Today",
    navLabel: "Today",
    icon: House,
    element: <TodayScreen />,
  },
  {
    path: "/history",
    title: "History",
    navLabel: "History",
    icon: CalendarDays,
    element: <HistoryScreen />,
  },
  {
    path: "/settings",
    title: "Settings",
    navLabel: "Settings",
    icon: Settings2,
    element: <SettingsScreen />,
  },
] as const;
