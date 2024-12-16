"use client";

import React, { Suspense, useEffect } from "react";
import Buy from "./Buy";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Types for the details prop
interface Details {
  email: string;
  details: any; // Update this type as per the actual structure of details
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  name: string;
  currency: string;
  amount: number;
  order_id: string;
  description: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
}

const BuyProduct = ({ details }: { details: Details }) => {
  const router = useRouter();
  console.log("dfsdfsdfsddfsdf")
console.log(details,"dfsdfsdfsdf");
  useEffect(() => {
    // Load Razorpay script
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  const makePayment = async ({ productId = null }: { productId?: string | null }) => {
    const key = process.env.RAZORPAY_API_KEY;

    try {
      // Make API call to the serverless API
      console.log("details","details");
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALURL}/api/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useremail: details.email,
          detail: details.details,
        }),
      });
      console.log(response,"response");
      const { order } = await response.json();
     console.log(order,"order");
      if (!order) {
        console.error("Order creation failed");
        return;
      }
    console.log(order,"order");
      const options: RazorpayOptions = {
        key: "rzp_live_EK5ZQ28uT39Z04",
        name: "IndieCaptions",
        currency: order.currency,
        amount: order.amount,
        order_id: order.id,
        description: "Payment for Credits",
        handler: async function (response: RazorpayResponse) {
          try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_LOCALURL}/api/paymentverify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const res = await data.json();

            if (res?.message === "success") {
              router.push(`${process.env.NEXT_PUBLIC_LOCALURL}/`);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "IndieCaptions",
          email: details.email,
        },
      };

      if (typeof window.Razorpay !== 'function') {
        alert("Razorpay SDK failed to load. Please try again later.");
        return;
      }

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        alert("Payment failed. Please try again");
      });
    } catch (error) {
      console.error("Payment initialization failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <Buy makePayment={makePayment} useremail={details.email} />
    </Suspense>
  );
};

export default BuyProduct;




