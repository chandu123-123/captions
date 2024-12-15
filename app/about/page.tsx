export default function AboutPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">About CaptionGen</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          CaptionGen is a cutting-edge platform that leverages artificial intelligence to provide accurate and efficient caption generation services for content creators worldwide.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-6">
          To make content accessible to everyone through accurate, fast, and affordable caption generation services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
        <p className="text-muted-foreground mb-6">
          We use state-of-the-art AI models and natural language processing to ensure the highest quality captions for your content.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li>Advanced AI Technology</li>
          <li>Multiple Language Support</li>
          <li>Fast Processing</li>
          <li>Affordable Pricing</li>
          <li>24/7 Customer Support</li>
        </ul>
      </div>
    </div>
  );
} 