import { CircleAlert } from "lucide-react";
import { AppIcon } from "../../ui/icons";

export function ErrorNote({ text }: { text: string }) {
  return (
    <p className="supporting-note supporting-note--icon supporting-note--error" role="alert">
      <AppIcon icon={CircleAlert} className="supporting-note__icon" />
      <span>{text}</span>
    </p>
  );
}
