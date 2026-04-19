interface LogActionProps {
  isLogged: boolean;
  onToggle: () => void;
}

export function LogAction({ isLogged, onToggle }: LogActionProps) {
  return (
    <div>
      <button onClick={onToggle}>
        {isLogged ? "Remove period log for today" : "Log period today"}
      </button>
      {isLogged ? <p>Logged for today</p> : null}
    </div>
  );
}
