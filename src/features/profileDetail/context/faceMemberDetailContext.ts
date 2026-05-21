import { createContext } from 'react';
import type {
  FaceProfileCommentRow,
  FaceProfileDetail,
  FaceProfileReviewRow,
} from '../../../api/services/faceProfilesApi';

export interface FaceMemberDetailContextValue {
  faceId: number;
  faceIndex: string;
  userId: string;
  detail: FaceProfileDetail;
  comments: FaceProfileCommentRow[];
  reviews: FaceProfileReviewRow[];
  token: string | undefined;
  isSelf: boolean;
  refreshAll: () => Promise<void>;
}

export const FaceMemberDetailContext = createContext<FaceMemberDetailContextValue | null>(null);
