import { HistoryScreen } from "../features/history/HistoryScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TodayScreen } from "../features/today/TodayScreen";

export const routes = [
  {
    path: "/",
    label: "Today",
    element: <TodayScreen />
  },
  {
    path: "/history",
    label: "History",
    element: <HistoryScreen />
  },
  {
    path: "/settings",
    label: "Settings",
    element: <SettingsScreen />
  }
];
