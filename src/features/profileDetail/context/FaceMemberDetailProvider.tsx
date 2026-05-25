import type { ReactNode } from 'react';
import {
	FaceMemberDetailContext,
	type FaceMemberDetailContextValue,
} from './faceMemberDetailContext';

export function FaceMemberDetailProvider({
	value,
	children,
}: {
	value: FaceMemberDetailContextValue;
	children: ReactNode;
}) {
	return (
		<FaceMemberDetailContext.Provider value={value}>{children}</FaceMemberDetailContext.Provider>
	);
}
