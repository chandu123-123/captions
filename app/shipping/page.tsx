export default function ShippingPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Digital Service</h2>
          <p className="text-muted-foreground">
            IndieCaptions is a digital service that provides automated caption generation. 
            As we do not sell or ship physical products, we do not have a shipping policy. 
            All our services are delivered instantly through our web platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Delivery</h2>
          <p className="text-muted-foreground">
            Upon successful payment:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li>Credits are added to your account instantly</li>
            <li>Caption generation service is available immediately</li>
            <li>Generated captions can be downloaded directly from the platform</li>
            <li>No physical shipment or delivery is involved</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 