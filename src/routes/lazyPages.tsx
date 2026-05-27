import { lazy } from 'react';

export const HomePage = lazy(() =>
	import('../pages/HomePage').then((m) => ({ default: m.HomePage }))
);
export const FacePageView = lazy(() =>
	import('../components/FacePageView').then((m) => ({ default: m.FacePageView }))
);
export const HomePageProtected = lazy(() =>
	import('../pages/HomePageProtected').then((m) => ({ default: m.HomePageProtected }))
);
export const ProfilePage = lazy(() =>
	import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
export const UsersPage = lazy(() =>
	import('../pages/UsersPage').then((m) => ({ default: m.UsersPage }))
);
export const UserDetailPage = lazy(() =>
	import('../pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage }))
);
export const ComponentListPage = lazy(() =>
	import('../pages/ComponentListPage').then((m) => ({ default: m.ComponentListPage }))
);
export const ComponentDetailPage = lazy(() =>
	import('../pages/ComponentDetailPage').then((m) => ({ default: m.ComponentDetailPage }))
);
export const AlbumDetailPage = lazy(() =>
	import('../pages/AlbumDetailPage').then((m) => ({ default: m.AlbumDetailPage }))
);
export const BlogDetailPage = lazy(() =>
	import('../pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage }))
);
export const ReelDetailPage = lazy(() =>
	import('../pages/ReelDetailPage').then((m) => ({ default: m.ReelDetailPage }))
);
export const FaceProfilesListPage = lazy(() =>
	import('../pages/FaceProfilesListPage').then((m) => ({ default: m.FaceProfilesListPage }))
);
export const FaceProfileDetailPage = lazy(() =>
	import('../pages/FaceProfileDetailPage').then((m) => ({ default: m.FaceProfileDetailPage }))
);
export const StoriesListPage = lazy(() =>
	import('../pages/StoriesListPage').then((m) => ({ default: m.StoriesListPage }))
);
export const MySubmissionsPage = lazy(() =>
	import('../pages/MySubmissionsPage').then((m) => ({ default: m.MySubmissionsPage }))
);
export const VideoLoungeDetailPage = lazy(() =>
	import('../pages/VideoLoungeDetailPage').then((m) => ({ default: m.VideoLoungeDetailPage }))
);
