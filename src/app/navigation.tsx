import type { MouseEvent, ReactElement } from "react";
import { CalendarDays, House, Settings2 } from "../ui/icons";
import { HistoryScreen } from "../features/history/HistoryScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TodayScreen } from "../features/today/TodayScreen";

export interface AppScreen {
  path: "/" | "/history" | "/settings";
  title: string;
  navLabel: string;
  icon: typeof House;
  render: () => ReactElement;
}

export const appScreens: readonly AppScreen[] = [
  {
    path: "/",
    title: "Today",
    navLabel: "Today",
    icon: House,
    render: () => <TodayScreen />,
  },
  {
    path: "/history",
    title: "History",
    navLabel: "History",
    icon: CalendarDays,
    render: () => <HistoryScreen />,
  },
  {
    path: "/settings",
    title: "Settings",
    navLabel: "Settings",
    icon: Settings2,
    render: () => <SettingsScreen />,
  },
] as const;

export function getAppScreen(pathname: string) {
  return appScreens.find((screen) => screen.path === pathname) ?? appScreens[0];
}

export function shouldHandleAppNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}
