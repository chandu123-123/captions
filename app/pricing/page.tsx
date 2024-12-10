import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import BuyProduct from "@/components/razorpay/BuyProduct";

const plans = [
  {
    name: "Starter",
    price: "₹499",
    credits: 100,
    features: [
      "100 minutes of audio processing",
      "Basic language support",
      "Standard processing speed",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₹1,499",
    credits: 500,
    popular: true,
    features: [
      "500 minutes of audio processing",
      "All languages supported",
      "Priority processing",
      "Phonetic transcription",
      "24/7 priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    credits: 2000,
    features: [
      "2000 minutes of audio processing",
      "All premium features",
      "Dedicated account manager",
      "Custom API access",
      "Advanced analytics",
      "Custom solutions",
    ],
  },
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="py-16 container">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your captioning needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 shadow-lg ${
              plan.popular
                ? "border-primary bg-primary/5 shadow-primary/10"
                : "bg-card"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div>
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">
                {plan.credits} credits included
              </p>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {session?.user.email ? (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <BuyProduct
                    details={{
                      email: session?.user.email,
                      details: plan, // Pass plan data as 'details' property
                    }}
                  />
                </Button>
              ) : (
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  Login
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
        <p className="text-muted-foreground mb-6">
          Contact us for custom pricing tailored to your specific needs
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
