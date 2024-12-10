"use client";
import React, { Suspense, useEffect } from "react";
import Buy from "./Buy";
import { useRouter  } from 'next/navigation';
import Loading from "@/app/loading";



const BuyProduct = (details) => {

  const router = useRouter()
 console.log(details)
  
  const makePayment = async ({ productId = null }) => {
    // "use server"
    const key = process.env.RAZORPAY_API_KEY;
    //console.log(key);
    // Make API call to the serverless API
    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALURL}/api/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useremail:details.email,detail:details.details // Include the email in the request body
        }),
      });
      const { order } = await response.json();

if (!order) {
  console.error("Order creation failed");
  return;
}
 //   console.log(order.id);
    const options = {
      key: key,
      name: "FresheResume",
      currency: order.currency,
      amount: order.amount,
      order_id: order.id,
      description: "Payment for Downloading Resume",
      // image: logoBase64,
      handler: async function (response) {
        // if (response.length==0) return <Loading/>;
      //  console.log(response);
      console.log("paymentverifybefore")
        const data = await  fetch(`${process.env.NEXT_PUBLIC_LOCALURL}/api/paymentverify`, {
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


        console.log("paymentverifyafter")
        const res = await data.json();

       // console.log("response verify==",res)
       console.log(res)
        if(res?.message=="success")
        {
          
        //  const res= await fetch(`${process.env.NEXT_PUBLIC_LOCALURL}/api/updatepaid`,{
        //   method:"POST",
        //   mode:'no-cors',
        //       body:JSON.stringify({useremail})}
        //  );
        //  const data=await res.json()
        //  if(data.paid==true){
        //   dispatch(setPaid())
        //  }
        //  else{
        //   dispatch(setunPaid())
        //  }
          console.log("redirected.......")

          router.push(`${process.env.NEXT_PUBLIC_LOCALURL}/`)

        }

        // Validate payment at server - using webhooks is a better idea.
        // alert(response.razorpay_payment_id);
        // alert(response.razorpay_order_id);
        // alert(response.razorpay_signature);
      },
      prefill: {
        name: "FresherResume",
        email: useremail,
      },
    };
     console.log("rammu")
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      alert("Payment failed. Please try again");
    });
  };

  return (
    <>
    <Suspense fallback={<Loading/>}>
      <Buy makePayment={makePayment} useremail={details.email}/>
      </Suspense>
    </>
  );
};

export default BuyProduct;