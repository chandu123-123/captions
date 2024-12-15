"use client"
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import BuyProduct from "@/components/razorpay/BuyProduct";

const plans = [
  {
    name: "Starter",
    price: "₹100",
    amount: "100",
    credits: 20,
    features: [
      "20 caption generations",
      "Basic language support (10 languages)",
      "Standard processing speed",
      "SRT export",
      "Email support",
      "❌ Priority processing",
      "❌ Advanced features",
    ],
  },
  {
    name: "Professional",
    price: "₹200",
    amount: "200",
    credits: 50,
    popular: true,
    features: [
      "50 caption generations",
      "All languages supported (20+)",
      "Priority processing",
      "Phonetic transcription",
      "24/7 priority support",
      "❌ Bulk processing",
      "❌ API access",
    ],
  },
  {
    name: "Creator",
    price: "₹500",
    amount: "500",
    credits: 100,
    features: [
      "100 caption generations",
      "All languages supported (20+)",
      "Fastest processing speed",
      "Phonetic transcription",
      "Bulk processing",
      "Priority support",
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
             
                  <BuyProduct
                    details={{
                      email: session?.user.email,
                      details: plan, // Pass plan data as 'details' property
                    }}
                  />
             
              ) : (
                <Button  className={`
                
                  inline-flex items-center justify-center
                  px-8 py-3
                  text-base font-medium
                  rounded-lg
                  transition-all duration-200
                  transform hover:scale-[1.02]
                  shadow-lg hover:shadow-xl
                  
                  bg-primary/80 text-white cursor-not-allowed opacity-80
                  
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[200px]
                `} >
                  Login
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
        <p className="text-muted-foreground mb-6">
          Contact us for custom pricing tailored to your specific needs
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div> */}
    </div>
  );
}
