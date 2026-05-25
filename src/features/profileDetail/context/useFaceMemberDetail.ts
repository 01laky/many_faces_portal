import { useContext } from 'react';
import {
	FaceMemberDetailContext,
	type FaceMemberDetailContextValue,
} from './faceMemberDetailContext';

export function useFaceMemberDetail(): FaceMemberDetailContextValue {
	const ctx = useContext(FaceMemberDetailContext);
	if (!ctx) {
		throw new Error('useFaceMemberDetail must be used within FaceMemberDetailProvider');
	}
	return ctx;
}
