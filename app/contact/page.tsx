"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Email</h3>
                <p className="text-muted-foreground">indiecaptions@gmail.com</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Operating Address</h3>
                <p className="text-muted-foreground">
                  LB Nagar<br />
                  Hyderabad, Telangana<br />
                  India
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>We aim to respond to all inquiries within 24 hours during business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 