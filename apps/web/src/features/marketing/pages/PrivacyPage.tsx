import { Link } from 'react-router-dom';

import { LegalPage, LegalSection, LegalList } from '@/features/marketing/components';

/**
 * What Cabmora does with people's data, described as it actually works.
 *
 * Written against the real system rather than a template: the processors
 * listed are the ones the platform genuinely sends data to, and the cookie
 * section says one cookie because there is one. A policy that describes a
 * different product is worse than none — it is a promise nobody is keeping.
 *
 * Several clauses need a commercial or legal decision that only Cabmora can
 * make; those are written conservatively and are listed in the handover notes
 * rather than guessed at here.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="2026-09-28"
      intro={
        <>
          This explains what we collect when you enquire, book or use your client portal, why we
          hold it, who else sees it, and what you can ask us to do about it. We have tried to write
          it in plain English rather than the usual thicket.
        </>
      }
    >
      <LegalSection heading="Who we are">
        <p>
          Cabmora Media, a photography and videography studio based at Bartle House, Oxford Court,
          Manchester, M2 3WQ. We are the data controller for the information described here.
        </p>
        <p>
          For anything in this policy, write to{' '}
          <a
            href="mailto:hello@cabmoramedia.com"
            className="text-gold hover:text-ink border-b border-gold/30"
          >
            hello@cabmoramedia.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>Only what the work requires:</p>
        <LegalList
          items={[
            <>
              <strong className="font-medium text-ink">When you enquire</strong> — your name, email
              address, phone number if you give one, the kind of event, its date, and whatever you
              write in the message.
            </>,
            <>
              <strong className="font-medium text-ink">When you have an account</strong> — your name
              and email address, and a password we never store in readable form.
            </>,
            <>
              <strong className="font-medium text-ink">Your project</strong> — the details of the
              shoot, its progress, the comments and change requests you leave, and whether you have
              approved the work.
            </>,
            <>
              <strong className="font-medium text-ink">Photographs and film</strong> — the images we
              take at your event, which will include you and your guests.
            </>,
            <>
              <strong className="font-medium text-ink">Billing</strong> — invoices, what has been
              paid and when. Card details are handled by our payment provider and never reach our
              systems.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="Your photographs">
        <p>
          Images of you and your guests are the most personal thing we hold, so they are worth
          setting out separately.
        </p>
        <LegalList
          items={[
            'Previews in your portal carry a watermark until you accept the work, and the links to them expire after a few minutes rather than working forever.',
            'Nothing is visible to you until your photographer chooses to release it, and nothing is visible to anyone outside your project at all.',
            'We do not use your photographs in our portfolio, on social media or in any advertising without asking you first. If we ask and you say no, that is the end of it.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="Why we hold it, and on what basis">
        <LegalList
          items={[
            <>
              <strong className="font-medium text-ink">To do the work you asked for</strong> —
              answering your enquiry, booking the consultation, shooting the event and delivering
              the results. This is necessary to perform our contract with you.
            </>,
            <>
              <strong className="font-medium text-ink">To run the business</strong> — invoicing,
              keeping records, and keeping the platform secure. Our legitimate interest in operating
              a studio, balanced against your privacy.
            </>,
            <>
              <strong className="font-medium text-ink">To meet legal obligations</strong> —
              financial records are kept for as long as tax law requires.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="Who else sees it">
        <p>
          We use a small number of suppliers to run the platform. Each sees only what it needs, and
          none of them may use your data for their own purposes.
        </p>
        <LegalList
          items={[
            <>
              <strong className="font-medium text-ink">Mailtrap</strong> — sends the emails we send
              you, so it handles your name and email address.
            </>,
            <>
              <strong className="font-medium text-ink">Cloudflare R2</strong> — stores your
              photographs and film.
            </>,
            <>
              <strong className="font-medium text-ink">Railway</strong> — hosts the platform and the
              database behind it.
            </>,
            <>
              <strong className="font-medium text-ink">Google</strong> — creates the calendar entry
              and video link for your consultation, so it sees the appointment and your email
              address.
            </>,
            <>
              <strong className="font-medium text-ink">Stripe</strong> — takes card payments. Your
              card details go to Stripe directly and we never hold them.
            </>,
            <>
              <strong className="font-medium text-ink">Sentry</strong> — receives technical reports
              when something breaks. These are configured to exclude personal data.
            </>,
          ]}
        />
        <p>
          We do not sell your data, and we do not share it for advertising. Some of these suppliers
          operate outside the UK; where they do, the transfer relies on the safeguards UK data
          protection law requires.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          One cookie, and it exists so you can stay signed in. It cannot be read by scripts running
          in your browser, and it is removed when you sign out.
        </p>
        <p>
          We do not use advertising cookies, and we do not track you across other websites. If that
          ever changes we will ask your permission first rather than telling you afterwards.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Enquiries that do not become bookings are kept while they might still turn into work, and
          removed after that. Project records and photographs are kept for as long as you are a
          client and for a period afterwards, so that you can come back for files you have lost.
          Financial records are kept for the period tax law requires.
        </p>
        <p>If you want your photographs removed sooner, ask us and we will do it. See below.</p>
      </LegalSection>

      <LegalSection heading="What you can ask for">
        <p>Under UK data protection law you can ask us to:</p>
        <LegalList
          items={[
            'Show you what we hold about you',
            'Correct anything that is wrong',
            'Delete it, including your photographs',
            'Send you a copy in a portable form',
            'Stop or limit what we do with it',
          ]}
        />
        <p>
          Write to{' '}
          <a
            href="mailto:hello@cabmoramedia.com"
            className="text-gold hover:text-ink border-b border-gold/30"
          >
            hello@cabmoramedia.com
          </a>{' '}
          and we will respond within a month. If you are unhappy with how we have handled it, you
          can complain to the Information Commissioner&rsquo;s Office at{' '}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noreferrer"
            className="text-gold hover:text-ink border-b border-gold/30"
          >
            ico.org.uk
          </a>
          , though we would rather you told us first so we can put it right.
        </p>
      </LegalSection>

      <LegalSection heading="How we protect it">
        <LegalList
          items={[
            'Everything travels encrypted between your browser and us.',
            'Passwords are stored hashed, so nobody at Cabmora can read yours.',
            'Links to your photographs are signed and expire, so a copied link stops working.',
            'Repeated wrong sign-in attempts are throttled.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If we change this policy we will update the date at the top. If a change materially
          affects what we do with your photographs, we will tell you directly rather than expecting
          you to notice.
        </p>
        <p>
          Our{' '}
          <Link to="/terms" className="text-gold hover:text-ink border-b border-gold/30">
            Terms of Service
          </Link>{' '}
          cover the commercial side of working with us.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
