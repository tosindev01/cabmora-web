import { Navigate, Route, Routes } from 'react-router-dom';

import LandingPage from '@/features/marketing/pages/LandingPage';
import SharedGalleryPage from '@/features/sharing/pages/SharedGalleryPage';
import ClientBillingPage from '@/features/client/pages/ClientBillingPage';
import ClientMediaPage from '@/features/client/pages/ClientMediaPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import AcceptInvitePage from '@/features/auth/pages/AcceptInvitePage';
import FlowApplyPage from '@/features/flow/pages/FlowApplyPage';
import FlowHomePage from '@/features/flow/pages/FlowHomePage';
import FlowLoginPage from '@/features/flow/pages/FlowLoginPage';
import FlowPricingPage from '@/features/flow/pages/FlowPricingPage';
import FlowSetupPasswordPage from '@/features/flow/pages/FlowSetupPasswordPage';
import SplitEntryPage from '@/features/flow/pages/SplitEntryPage';
import { FlowIntroHost } from '@/shared/site';
import PrivacyPage from '@/features/marketing/pages/PrivacyPage';
import TermsPage from '@/features/marketing/pages/TermsPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import CustomerSignupPage from '@/features/auth/pages/CustomerSignupPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import { ProtectedRoute } from '@/features/auth/components';

import AboutPage from '@/features/marketing/pages/AboutPage';
import WorkPage from '@/features/marketing/pages/WorkPage';
import BlogPage from '@/features/content/pages/BlogPage';
import BlogPostPage from '@/features/content/pages/BlogPostPage';
import HelpCenterPage from '@/features/content/pages/HelpCenterPage';
import ContactPage from '@/features/enquiry/pages/ContactPage';
import { ScrollToHash } from '@/app/ScrollToHash';

import DashboardPage from '@/features/projects/pages/DashboardPage';
import ProjectsPage from '@/features/projects/pages/ProjectsPage';
import ProjectDetailsPage from '@/features/projects/pages/ProjectDetailsPage';
import CabmoraAiPage from '@/features/projects/pages/CabmoraAiPage';

import GalleriesPage from '@/features/media/pages/GalleriesPage';
import MediaUploadPage from '@/features/media/pages/MediaUploadPage';
import StoragePage from '@/features/media/pages/StoragePage';

import BillingPage from '@/features/billing/pages/BillingPage';
import MessagesPage from '@/features/messaging/pages/MessagesPage';
import SettingsPage from '@/features/account/pages/SettingsPage';
import ProfilePage from '@/features/account/pages/ProfilePage';
import CreatorLandingPage from '@/features/account/pages/CreatorLandingPage';
import ClientMessagesPage from '@/features/client/pages/ClientMessagesPage';
import ClientOverviewPage from '@/features/client/pages/ClientOverviewPage';
import ClientPortalPage from '@/features/client/pages/ClientPortalPage';
import ClientProjectsPage from '@/features/client/pages/ClientProjectsPage';
import ClientSettingsPage from '@/features/client/pages/ClientSettingsPage';
import { useDocumentMeta } from '@/shared/seo';

/**
 * Every screen the designer built, routed for review.
 *
 * The portal routes now sit behind `ProtectedRoute`, which requires a session
 * cookie. That gate is UX only — the pages still render mock data, and real
 * authorisation belongs to the API (`require_role` per endpoint, WP5). Anyone
 * can reconstruct this bundle; only the backend can refuse them.
 *
 * `/login` and `/signup` use apps/web's own auth screens, not the designer's
 * duplicates of them.
 */
export default function AppRouter() {
  // Once, here. A hook each page had to call is a hook the next page forgets,
  // and the symptom — one screen sharing with the wrong title — is invisible
  // until somebody pastes the link somewhere.
  useDocumentMeta();

  return (
    <>
      {/* Mounted beside the routes, not inside one: the banner that raises it
          sits in the site header, which every page renders for itself. */}
      <FlowIntroHost />
      <ScrollToHash />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Public on purpose, and the only route that shows anybody's
            photographs without a session. The token in the path is the whole
            claim; what it may see is decided server-side. */}
        {/* Two paths, one page.

            `/s/:token` is what has been issued to clients and is in people's
            messages already, so it keeps working. In production nginx sends
            it to the API instead, which answers a crawler with Open Graph
            tags for that specific gallery and forwards a person here. The
            route stays so the link still resolves in local development, where
            there is no nginx in front. */}
        <Route path="/s/:token" element={<SharedGalleryPage />} />
        <Route path="/gallery/:token" element={<SharedGalleryPage />} />
        {/* A creator's own public landing page. Public: it is what a client
            opens from a link before they have any account. */}
        <Route path="/creators/:slug" element={<CreatorLandingPage />} />
        {/* `/signup` is the customer funnel — the common case, and the one
          that had no screen at all. Creators apply on a separate route and
          land PENDING until an admin accepts them. */}
        <Route path="/signup" element={<CustomerSignupPage />} />
        <Route path="/signup/creator" element={<SignupPage />} />
        {/* Where an admin-sent invite lands. Public: the token is the
          credential, and the holder has no session yet. */}
        <Route path="/accept-invite" element={<AcceptInvitePage />} />

        {/* Where a password-reset link lands. Public for the same reason: the
          token is the credential, and whoever is using it cannot sign in. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Cabmora Flow — the creator product. Public: these are what a
          photographer reads before deciding to apply, which is before they
          have any account with us. `/flow/signup` is the designer's second
          name for the application form; both land in the same place rather
          than one quietly 404ing. */}
        <Route path="/split" element={<SplitEntryPage />} />
        <Route path="/flow" element={<FlowHomePage />} />
        <Route path="/flow/pricing" element={<FlowPricingPage />} />
        <Route path="/flow/apply" element={<FlowApplyPage />} />
        <Route path="/flow/signup" element={<FlowApplyPage />} />
        <Route path="/flow/login" element={<FlowLoginPage />} />
        <Route path="/flow/setup-password" element={<FlowSetupPasswordPage />} />

        {/* Legal. Public and unauthenticated on purpose — these have to be
          readable by somebody deciding whether to trust us with their data,
          which is before they have an account. */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Content */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* The creator studio. A customer reaching these screens would see
          storage plans, a media library and a creator profile that are not
          theirs — so the gate is on the route, not only on the sidebar. This
          is a UX gate; the API is what actually refuses their data. */}
        <Route element={<ProtectedRoute roles={['creator', 'admin']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/ai" element={<CabmoraAiPage />} />
          <Route path="/galleries" element={<GalleriesPage />} />
          <Route path="/upload" element={<MediaUploadPage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Customer portal. Any accepted account may look — a creator switching
          across via "View as Client" is deliberate.

          A client can hold several projects, so this is list-then-project like
          the creator side: Overview and Projects are real, the per-project view
          is the existing gallery screen, and Media/Messages/Billing name what
          they are waiting on rather than inventing it. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/client/dashboard" element={<ClientOverviewPage />} />
          <Route path="/client/projects" element={<ClientProjectsPage />} />
          <Route path="/client/projects/:id" element={<ClientPortalPage />} />
          <Route path="/client/media" element={<ClientMediaPage />} />
          <Route path="/client/messages" element={<ClientMessagesPage />} />
          <Route path="/client/billing" element={<ClientBillingPage />} />
          <Route path="/client/settings" element={<ClientSettingsPage />} />
        </Route>

        {/* Any unknown path falls back to the landing page. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
