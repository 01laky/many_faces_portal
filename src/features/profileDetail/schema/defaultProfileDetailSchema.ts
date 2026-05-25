import type { ProfileDetailGridSchema } from './profileDetailGridTypes';

/** Keep in sync with BeDemo.Api ProfileDetail/ProfileDetailGridDefaults.DefaultGridSchemaJson */
export const DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON = `{"schemaVersion":1,"rowHeight":80,"breakpoints":{"lg":1200,"md":996,"sm":768,"xs":480,"xxs":0},"cols":{"lg":12,"md":10,"sm":6,"xs":4,"xxs":2},"items":[{"i":"hero","x":0,"y":0,"w":12,"h":5,"sectionType":"profileHero","props":{"variant":"centered","includeMeta":true,"includeLike":true}},{"i":"comments","x":0,"y":5,"w":12,"h":6,"sectionType":"profileComments"},{"i":"reviews","x":0,"y":11,"w":12,"h":6,"sectionType":"profileReviews","props":{"showRecensionsDisabledMessage":true,"hideWhenRecensionsDisabled":false}}]}`;

export const DEFAULT_PROFILE_DETAIL_GRID_SCHEMA: ProfileDetailGridSchema = JSON.parse(
	DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON
) as ProfileDetailGridSchema;
