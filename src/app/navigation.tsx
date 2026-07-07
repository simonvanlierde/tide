import { CalendarDays, House, Settings2 } from "lucide-react";
import type { MouseEvent, ReactElement } from "react";
import { CalendarScreen } from "../features/calendar/CalendarScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TodayScreen } from "../features/today/TodayScreen";

export interface AppScreen {
  path: "/" | "/calendar" | "/settings";
  title: string;
  navLabel: string;
  icon: typeof House;
  render: () => ReactElement;
}

export const appScreens = [
  {
    path: "/",
    title: "Today",
    navLabel: "Today",
    icon: House,
    render: () => <TodayScreen />,
  },
  {
    path: "/calendar",
    title: "Calendar",
    navLabel: "Calendar",
    icon: CalendarDays,
    render: () => <CalendarScreen />,
  },
  {
    path: "/settings",
    title: "Settings",
    navLabel: "Settings",
    icon: Settings2,
    render: () => <SettingsScreen />,
  },
] as const satisfies readonly AppScreen[];

export function getAppScreen(pathname: string) {
  return appScreens.find((screen) => screen.path === pathname) ?? appScreens[0];
}

export function shouldHandleAppNavigation(
  event: MouseEvent<HTMLAnchorElement>,
) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}
