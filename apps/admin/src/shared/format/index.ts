/**
 * Formatting for the console.
 *
 * `formatMinor`, `nameCase` and `sentenceCase` are re-exported from
 * `@cabmora/ui` rather than written here: the portal renders the same project
 * titles, client names and figures, and a display rule kept in two apps is a
 * display rule that drifts. Re-exported through this barrel so every feature
 * keeps importing from one place regardless of where a helper lives.
 *
 * `stage.ts` stays local — stage ordering is the console's job, since the
 * client is never shown our internal pipeline.
 */
export { formatMinor, nameCase, sentenceCase } from '@cabmora/ui';
export { STAGE_LABEL, STAGE_ORDER, STAGE_PILL, nextStage } from './stage';
