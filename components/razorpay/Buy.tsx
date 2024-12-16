"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

// Define types for props
interface BuyProps {
  makePayment: (paymentDetails: { productId: string }) => void;
  useremail: string;
}

const Buy: React.FC<BuyProps> = ({ makePayment, useremail }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [load, setLoad] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const verifying = async () => {
    console.log("buy component");
  await makePayment({ productId: "IndieCaptions" });
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-3">
        <button
          onClick={async () => {
            setIsLoading(true);
            await verifying();
            setIsLoading(false);
          }}
          disabled={isLoading}
          className={`
            relative
            inline-flex items-center justify-center
            px-8 py-3
            text-base font-medium
            rounded-lg
            transition-all duration-200
            transform hover:scale-[1.02]
            shadow-lg hover:shadow-xl
            ${isLoading 
              ? 'bg-primary/80 text-white cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            min-w-[200px]
          `}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Buy Now</span>
              </>
            )}
          </div>
        </button>
        {isLoading && (
          <p className="mt-3 text-sm text-muted-foreground animate-pulse">
            Please wait while processing your payment...
          </p>
        )}
      </div>
    </div>
  );
};

export default Buy;
