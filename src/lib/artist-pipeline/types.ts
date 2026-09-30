import type { Genre } from "../genres";

export type Role = "headliner" | "co-headliner" | "supporting";
export type Rating = "high" | "medium" | "low";
export type Platform = "spotify" | "youtube";
export type EventCategory = "music" | "comedy" | "theater" | "sports" | "other";
export type NonArtistCategory = "tribute" | "orchestra_score" | "dj" | "comedian" | "event_name" | "other";
export type ActKind = "original_artist" | "not_an_artist" | "unknown";

export interface PipelineEvent {
  id: string;
  title: string;
  date: string;               // YYYY-MM-DD
  venueName: string;
  eventUrl: string | null;
  supportingArtists: string[];
}

export interface ExtractedAct {
  billed_as: string;
  clean_name: string;
  role: Role;
  billing_order: number;      // 1-based
  kind: ActKind;
  non_artist_category: NonArtistCategory | null;
  genres: Genre[];
  hometown: string | null;
  reason: string;
}

export interface Extraction {
  category: EventCategory;
  category_rating: Rating;
  event_genres: Genre[];
  lineup_rating: Rating;
  reason: string;
  acts: ExtractedAct[];
}

export interface Candidate {
  platform: Platform;
  external_id: string;
  url: string;
  display_name: string;
  name_similarity: number;    // 0..1, computed in code
  genres: string[];           // raw platform tags (Spotify) or []
  details: string[];          // human-readable evidence lines (albums, description, subscriber count)
  official: boolean;          // YouTube "- Topic" channel
  description: string;        // YouTube channel description, "" for Spotify
}

export interface LinkFeatures {
  judge_rating: Rating;
  name_similarity: number;
  corroborated: boolean;
  location_evidence: boolean;
  web_citation: boolean;
  same_name_count: number;
  official_channel: boolean;
}

export interface LinkProposal {
  external_id: string;
  url: string;
  display_name: string;
  evidence: string[];
  confidence: number;
  raw_score: number;          // uncalibrated rawLinkScore (0 for alternatives)
  name_similarity: number;
  reason: string;
}

export interface LinkDecision {
  chosen: LinkProposal | null;
  alternatives: LinkProposal[];
  deferred?: "youtube_quota" | "escalation_budget";
}

export type LineupEntry =
  | { kind: "existing"; billed_as: string; artist_id: string; role: Role; billing_order: number;
      confidence: number; new_links?: { spotify?: LinkDecision; youtube?: LinkDecision } }
  | { kind: "new"; billed_as: string; clean_name: string; role: Role; billing_order: number;
      hometown: string | null; genres: Genre[]; confidence: number;
      spotify: LinkDecision; youtube: LinkDecision }
  | { kind: "not_an_artist"; billed_as: string; category: NonArtistCategory; reason: string; confidence: number };

export interface EventClassification {
  category: EventCategory;
  category_confidence: number;
  event_genres: Genre[];
  reason: string;
}

export interface Proposal {
  event_id: string;
  schema_version: 2;
  event: EventClassification;
  artists: LineupEntry[];
  lineup_confidence: number;
  overall_confidence: number;
}

export interface StoredArtist {
  id: string;
  name: string;
  genres: string[];
  spotify_id: string | null;
  youtube_channel_id: string | null;
  hometown: string | null;
}
