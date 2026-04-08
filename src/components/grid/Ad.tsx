/**
 * Ad - First wall ticket (listing-style) for the current face
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import {
  fetchAllWallTicketsForFace,
  type WallTicketListItem,
} from '../../api/services/wallTicketsApi';
import { wallTicketListingImageUrl } from './gridDisplayHelpers';
import './Ad.scss';

export function Ad() {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [ticket, setTicket] = useState<WallTicketListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || faceId == null) {
      setLoading(false);
      setTicket(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAllWallTicketsForFace(token, faceId);
        if (!cancelled) setTicket(list[0] ?? null);
      } catch {
        if (!cancelled) setTicket(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  if (!token || faceId == null) {
    return (
      <div className="ad-component ad-component--message">
        <span className="ad-empty-text">Sign in to see listings.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ad-component ad-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ad-component ad-component--message">
        <span className="ad-empty-text">No listings on the wall yet.</span>
      </div>
    );
  }

  return (
    <div className="ad-component">
      <img
        className="ad-photo"
        src={wallTicketListingImageUrl(ticket.id)}
        alt={ticket.title}
        loading="lazy"
      />
      <div className="ad-overlay">
        <span className="ad-price">Wall</span>
        <span className="ad-title">{ticket.title}</span>
        <span className="ad-location">{ticket.creatorName}</span>
      </div>
    </div>
  );
}
