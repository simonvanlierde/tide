import { useId } from "react";
import { InfoPopover } from "./InfoPopover";

interface SwitchRowProps {
  label: string;
  infoLabel: string;
  help: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SwitchRow({
  label,
  infoLabel,
  help,
  checked,
  onChange,
}: SwitchRowProps) {
  // Label the switch by its text alone, not the info button beside it.
  const labelId = useId();

  return (
    <div className="settings-row settings-row--switch">
      <span className="settings-label">
        <span id={labelId}>{label}</span>
        <InfoPopover label={infoLabel} align="start">
          {help}
        </InfoPopover>
      </span>
      <div className="settings-row__controls">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          className="switch"
          onClick={() => onChange(!checked)}
        />
      </div>
    </div>
  );
}
