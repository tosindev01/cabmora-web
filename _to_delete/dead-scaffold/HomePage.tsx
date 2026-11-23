import EnquiryForm from '@/features/enquiry/components/EnquiryForm';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Capture Your Moments, Professionally</h1>
        <p>
          Cabmora delivers premium photography and videography for weddings,
          birthdays, business events, graduations and more — with a secure
          digital experience for reviewing and approving your media.
        </p>
      </section>
      <section>
        <EnquiryForm />
      </section>
    </>
  );
}
