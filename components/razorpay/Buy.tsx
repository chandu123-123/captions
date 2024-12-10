"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
const Buy = ({ makePayment ,useremail}) => {

  const [isLoading, setisLoading] = useState(false);
  const [load,setload]=useState("")
  const [message, setmessage] = useState("");
const router=useRouter()
  const verifying = () => {
  

        makePayment({ productId: "FresherResume" });
      
    }


  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-3">
        <button
          onClick={() => {
          
            verifying();
          }}
          disabled={isLoading}
          className={`btn btn-outline btn-primary ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
        </button>
      </div>
     
    </div>
  );
};
export default Buy;