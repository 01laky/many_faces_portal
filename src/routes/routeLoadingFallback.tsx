export function RouteLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
        fontSize: '15px',
        color: '#666',
      }}
    >
      Loading…
    </div>
  );
}
