import { useStore } from '../store/useStore';

export default function Toasts() {
  const notifications = useStore((s) => s.notifications);
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className={`toast-item ${n.type}`}>
          <span className="mr-2">
            {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : n.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          {n.msg}
        </div>
      ))}
    </div>
  );
}
