interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
}

export function LogAction({ isLogged, onToggle }: LogActionProps) {
  return (
    <div className="log-action">
      <button className="primary-action" onClick={onToggle}>
        {isLogged ? "Remove bleeding log" : "Log bleeding today"}
      </button>
      {isLogged ? <p className="supporting-note">Marked as a bleeding day</p> : null}
    </div>
  );
}
