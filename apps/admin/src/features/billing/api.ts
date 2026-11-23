/**
 * Billing HTTP, re-exported.
 *
 * The calls themselves moved to `shared/billing` when a second feature wanted
 * them: a project's Payments tab is a billing view scoped to one project, and
 * a feature importing another feature is the one import this codebase does not
 * allow. Re-exported through here so every billing screen keeps importing
 * from the same place it always did.
 */
export * from '@/shared/billing/api';
