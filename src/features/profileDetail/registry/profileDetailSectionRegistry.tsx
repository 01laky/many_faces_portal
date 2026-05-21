import type { ReactNode } from 'react';
import type { ProfileDetailGridItem } from '../schema/profileDetailGridTypes';
import { ProfileActionsSection } from '../sections/ProfileActionsSection';
import { ProfileCommentsSection } from '../sections/ProfileCommentsSection';
import { ProfileHeroSection } from '../sections/ProfileHeroSection';
import { ProfileMetaSection } from '../sections/ProfileMetaSection';
import { ProfileReviewsSection } from '../sections/ProfileReviewsSection';
import { ProfileSpacerSection } from '../sections/ProfileSpacerSection';
import { ProfileUnknownSection } from '../sections/ProfileUnknownSection';
import { UserContentSectionPlaceholder } from '../sections/UserContentSectionPlaceholder';

/** Maps a validated grid item to its portal section component (unknown types render a fallback). */
export function renderProfileDetailSection(item: ProfileDetailGridItem): ReactNode {
  const props = item.props ?? {};
  switch (item.sectionType) {
    case 'profileHero':
      return (
        <ProfileHeroSection
          includeMeta={props.includeMeta !== false}
          includeLike={props.includeLike !== false}
        />
      );
    case 'profileMeta':
      return <ProfileMetaSection />;
    case 'profileActions':
      return <ProfileActionsSection />;
    case 'profileComments':
      return <ProfileCommentsSection />;
    case 'profileReviews':
      return (
        <ProfileReviewsSection
          showRecensionsDisabledMessage={props.showRecensionsDisabledMessage !== false}
          hideWhenRecensionsDisabled={props.hideWhenRecensionsDisabled === true}
        />
      );
    case 'userAlbums':
      return <UserContentSectionPlaceholder sectionKey="userAlbums" />;
    case 'userBlogs':
      return <UserContentSectionPlaceholder sectionKey="userBlogs" />;
    case 'userReels':
      return <UserContentSectionPlaceholder sectionKey="userReels" />;
    case 'userStories':
      return <UserContentSectionPlaceholder sectionKey="userStories" />;
    case 'spacer':
      return <ProfileSpacerSection />;
    default:
      return <ProfileUnknownSection sectionType={item.sectionType} />;
  }
}
