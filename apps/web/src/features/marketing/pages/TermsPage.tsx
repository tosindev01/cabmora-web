import { Link } from 'react-router-dom';

import { LegalPage, LegalSection, LegalList } from '@/features/marketing/components';

/**
 * The commercial terms of working with Cabmora.
 *
 * Deliberately describes only what the platform and the studio actually do
 * today. Fees, deposits, cancellation windows and licensing are commercial
 * decisions rather than engineering ones, so they are written to point at the
 * individual quote rather than inventing numbers that would contradict it.
 */
export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="2026-09-28"
      intro={
        <>
          These terms cover booking a shoot with Cabmora and using the client portal. Anything
          specific to your event, including the coverage, the fee and the deadlines, lives in the
          quote and invoice we agree with you, and those take precedence over anything general here.
        </>
      }
    >
      <LegalSection heading="Who we are">
        <p>
          Cabmora Media, a photography and videography studio at Bartle House, Oxford Court,
          Manchester, M2 3WQ. Reach us at{' '}
          <a
            href="mailto:hello@cabmoramedia.com"
            className="text-gold hover:text-ink border-b border-gold/30"
          >
            hello@cabmoramedia.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Enquiries and consultations">
        <p>
          Sending an enquiry does not book anything. We will reply, usually arrange a short video
          consultation, and only then put a quote to you. A date is held for you once we have
          confirmed the booking in writing and any deposit stated on your invoice has been paid.
        </p>
      </LegalSection>

      <LegalSection heading="Fees and payment">
        <p>
          What you owe, when it is due and what any deposit covers are set out on your invoice. We
          accept bank transfer and card. Invoices are payable by the date shown on them.
        </p>
        <p>
          Where your project is set to require payment before delivery, the final files are released
          once the balance has cleared.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and cancellation">
        <p>
          Tell us as early as you can. Moving a date depends on whether we are free on the new one,
          and cancellation terms, including what happens to a deposit, are those set out in your
          quote or invoice.
        </p>
        <p>
          If something outside anyone&rsquo;s control stops us attending, we will offer you an
          alternative date or a refund of what you have paid for work not delivered.
        </p>
      </LegalSection>

      <LegalSection heading="Delivering the work">
        <p>How delivery works through the portal:</p>
        <LegalList
          items={[
            'We upload the shoot and choose which frames to share with you. Nothing is visible to you until we release it.',
            'What you see first are watermarked previews, sized for reviewing rather than printing.',
            'You can comment on any photograph and ask for changes. We will tell you when a change has been made.',
            'When you accept the work, the watermark comes off and the full-resolution files become available to you.',
          ]}
        />
        <p>
          Accepting the work means you are satisfied with it. Ask for anything you want changed
          before you accept rather than after.
        </p>
      </LegalSection>

      <LegalSection heading="Copyright and how you may use the images">
        <p>
          We retain copyright in the photographs and film we create, as is standard in the industry.
          What you receive is a licence to use them. The scope of that licence is stated in your
          quote, and for private clients it covers personal use: prints, albums, and sharing with
          family and friends.
        </p>
        <p>
          Commercial use, resale, and entering the images into competitions need our written
          agreement first. Please do not crop out or edit over our mark on anything still
          watermarked.
        </p>
        <p>
          We will not use your images to promote Cabmora without asking you. See the{' '}
          <Link to="/privacy" className="text-gold hover:text-ink border-b border-gold/30">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Keep your password to yourself and tell us if you think somebody else has it. You are
          responsible for what happens under your account. Do not attempt to reach projects that are
          not yours, and do not use the portal to store or share anything unlawful.
        </p>
        <p>We may suspend an account being used that way, and we will tell you why.</p>
      </LegalSection>

      <LegalSection heading="If something goes wrong">
        <p>
          We take real care of your files, keeping them on professional storage rather than a laptop
          in a bag. Even so, no system is beyond failure, and our liability for loss or damage is
          limited to the amount you have paid us for the work in question.
        </p>
        <p>
          Nothing here limits liability for death or personal injury caused by negligence, for
          fraud, or for anything else the law does not allow us to limit. If you are a consumer,
          your statutory rights are unaffected.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the law of England and Wales, and disputes fall to the courts
          of England and Wales.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          We may update these terms; the date at the top shows when they last changed. The terms
          that apply to your booking are the ones in force when you booked.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
