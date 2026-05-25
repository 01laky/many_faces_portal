/** Full-screen states while faces config is loading or failed (no router hooks required). */

export function FaceConfigLoadingView() {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				fontSize: '18px',
			}}
		>
			Loading routes configuration...
		</div>
	);
}

export function FaceConfigErrorView({ message }: { message: string }) {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				flexDirection: 'column',
				gap: '16px',
			}}
		>
			<div style={{ fontSize: '18px', color: 'red' }}>Failed to load routes configuration</div>
			<div style={{ fontSize: '14px', color: '#666' }}>{message}</div>
		</div>
	);
}
