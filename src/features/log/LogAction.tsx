interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
}

export function LogAction({ isLogged, onToggle }: LogActionProps) {
  return (
    <div className="log-action">
      <button className="primary-action" onClick={onToggle}>
        {isLogged ? "Remove period log for today" : "Log period today"}
      </button>
      {isLogged ? <p className="supporting-note">Logged for today</p> : null}
    </div>
  );
}
