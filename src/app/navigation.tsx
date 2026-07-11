import { CalendarDays, House, Settings2 } from "lucide-react";
import type { MouseEvent, ReactElement } from "react";
import { CalendarScreen } from "../features/calendar/CalendarScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TodayScreen } from "../features/today/TodayScreen";
import type { MessageKey } from "../i18n";

export interface AppScreen {
  path: "/" | "/calendar" | "/settings";
  labelKey: MessageKey;
  icon: typeof House;
  render: () => ReactElement;
}

export const appScreens = [
  {
    path: "/",
    labelKey: "nav.today",
    icon: House,
    render: () => <TodayScreen />,
  },
  {
    path: "/calendar",
    labelKey: "nav.calendar",
    icon: CalendarDays,
    render: () => <CalendarScreen />,
  },
  {
    path: "/settings",
    labelKey: "nav.settings",
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
