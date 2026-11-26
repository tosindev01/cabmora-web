export { apiFetch, apiUrl, ApiError } from './client';
export type { FieldError } from './client';
export { buildQuery, fetchList, fetchPage } from './pagination';
export type { Page, QueryValue } from './pagination';
// Namespaced: consumers name their own `login`/`logout` callbacks, and a bare
// named export would collide with them.
export * as authApi from './auth';
export * as accountApi from './account';
export * as collaborationApi from './collaboration';
export * as creatorLandingApi from './creatorLanding';
export * as supportApi from './support';
export * as notificationsApi from './notifications';
export type {
  AiGeneratedInvoiceApiDto,
  BriefingActionItemDto,
  BriefingChatResponseDto,
  CallStatus,
  ClientBriefingDto,
  CommunityCollaborationRequestDto,
  CommunityCommentDto,
  CommunityFeedDto,
  CommunityFollowerDto,
  CommunityPostDto,
  CreatorBriefingDto,
  CreatorReferralEntryDto,
  CreatorReferralSummaryDto,
  ProjectCallDto,
  ProjectCommentDto,
  ProjectTaskDto,
  ScreenSecurityStatusDto,
  TaskPriority,
  TaskStatus,
} from './collaboration';
export type {
  CreatorBookingRequestDto,
  CreatorBookingSubmission,
  CreatorPortfolioItemDto,
  CreatorStudioProfileDto,
  LandingAccentToken,
  LandingConfigDto,
  LandingFaqItem,
  LandingHeadingFont,
  LandingHeroLayout,
  LandingSectionsVisibility,
  LandingServicePackage,
  LandingStatItem,
  LandingTestimonial,
  LandingThemePreset,
} from './creatorLanding';
export type { AdminIssue, Issue, IssueStatus } from './support';
export type {
  AppNotification,
  NotificationFeed,
  NotificationTopic,
  MarkReadResult,
} from './notifications';
export type {
  NotificationKind,
  PreferenceChanges,
  Preferences,
  ProfileChanges,
} from './account';
export type {
  AccountType,
  AdminStats,
  CreatorPerformance,
  CreatorReport,
  EnquiryCounts,
  MonthlyPoint,
  MonthlyReport,
  Project,
  ProjectCounts,
  ProjectDetail,
  ProjectEvent,
  ProjectStage,
  ReleaseMode,
  WatermarkPolicy,
  UserCounts,
  BillingStats,
  Invoice,
  InvoiceAction,
  InvoiceDetail,
  InvoiceLineItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
  Refund,
  RefundState,
  RefundStatus,
  Settlement,
  TokenResponse,
  User,
  AccessGroup,
  Permission,
  UserRole,
  UserStatus,
} from './types';
