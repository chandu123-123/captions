"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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

  const verifying = () => {
    makePayment({ productId: "FresherResume" });
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-3">
        <button
          onClick={() => {
            verifying();
          }}
          disabled={isLoading}
          className={`btn btn-outline btn-primary ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {/* Button text can be set here */}
          {isLoading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
};

export default Buy;
