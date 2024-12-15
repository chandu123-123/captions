export default function RefundPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">No Refund Policy</h2>
          <p className="text-muted-foreground">
            At IndieCaptions, we maintain a no-refund policy on our services. This policy is in place because our credits are activated immediately upon purchase and our AI processing begins instantly when you upload your content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Commitment to Quality</h2>
          <p className="text-muted-foreground">
            We are confident in the quality of our service and ensure you get the best value for your investment through:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li>State-of-the-art AI technology for accurate transcription</li>
            <li>Support for multiple languages and phonetic translations</li>
            <li>Real-time processing and instant delivery</li>
            <li>Professional-grade caption formatting</li>
            <li>Dedicated customer support for any technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Before Purchase</h2>
          <p className="text-muted-foreground">
            We encourage users to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li>Review our service features thoroughly</li>
            <li>Check our supported languages and formats</li>
            <li>Contact our support team with any pre-purchase questions</li>
            <li>Start with our basic plan to test our service quality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
          <p className="text-muted-foreground">
            While we don&apos;t offer refunds, our dedicated support team is always available to help resolve any technical issues you may encounter while using our service. Contact us at indiecaptions@gmail.com for assistance.
          </p>
        </section>
      </div>
    </div>
  );
} 