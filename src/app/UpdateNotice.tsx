import { CircleAlert } from "lucide-react";
import { useT } from "../state/provider";
import { AppIcon } from "../ui/icons";
import { useUpdateAction } from "./updateNotice";

export function UpdateNotice() {
  const t = useT();
  const update = useUpdateAction();
  if (!update) return null;
  return (
    <div className="utility-card utility-card--slim newer-data-notice">
      <p className="supporting-note supporting-note--icon">
        <AppIcon icon={CircleAlert} className="supporting-note__icon" />
        <span>{t("app.updateReady")}</span>
      </p>
      <button type="button" className="text-action update-notice__reload" onClick={update}>
        {t("common.reload")}
      </button>
    </div>
  );
}
