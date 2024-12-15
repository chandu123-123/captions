export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information that you provide directly to us, including but not limited to your name, email address, and usage data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
          </p>
        </section>

        {/* Add more sections as needed */}
      </div>
    </div>
  );
} 