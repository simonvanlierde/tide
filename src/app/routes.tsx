import { HistoryScreen } from "../features/history/HistoryScreen";
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
  }
];
