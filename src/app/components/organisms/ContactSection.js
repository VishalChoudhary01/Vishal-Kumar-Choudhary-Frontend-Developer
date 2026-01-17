"use client";

import React, { useState } from "react";
import useDarkMode from "@/app/hooks/useDarkMode";
import ContactHeader from "./contact/ContactHeader";
import QuickContactCard from "./contact/QuickContactCard";
import ContactFormCard from "./contact/ContactFormCard";
import DownloadResumeCard from "./contact/DownloadResumeCard";
import { showToast } from "@/app/redux/featuresSlice/toastSlice";
import { useDispatch } from "react-redux";


export default function ContactSection() {
  const { isDarkMode } = useDarkMode();
  const dispatch = useDispatch();

  
  const email = "vishal.bhumca21@gmail.com";
  const phone = "+918083561822";

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    category: "freelance"
  });

  const contactOptions = [
    {
      icon: "whatsapp",
      label: "WhatsApp",
      value: "Chat instantly",
      link: `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hi Vishal 👋\nI came across your portfolio and would like to discuss an opportunity with you."
      )}`,
      description: "Quick response guaranteed"
    },
    {
      icon: "email",
      label: "Email",
      value: email,
      description: "Detailed inquiries"
    },
    {
      icon: "phone",
      label: "Phone",
      value: phone,
      link: `tel:${phone}`,
      description: "Available 10AM - 7PM IST"
    },
    
  ];

  const socialLinks = [
    { platform: "linkedin", label: "LinkedIn", link: "https://linkedin.com/in/vishal-portfolio" },
    { platform: "github", label: "GitHub", link: "https://github.com/vishal-dev" },
  ];

 



 const handleCopyEmail = async () => {
  try {
    // 1️⃣ Copy email
    await navigator.clipboard.writeText(email);
    setCopied(true);

    // 2️⃣ Show toast
    dispatch(
      showToast({
        text: `Email copied to clipboard`,
        iconType: "star",
      })
    );

    // 3️⃣ Reset copied icon
    setTimeout(() => setCopied(false), 1500);

    // 4️⃣ Delay → then open Gmail
    setTimeout(() => {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
        "_blank",
        "noopener,noreferrer"
      );
    }, 900); 

  } catch (error) {
    dispatch(
      showToast({
        message: "Failed to copy email",
        iconType: "eye",
      })
    );
  }
};



  const handleSubmit = (e) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent("Frontend Opportunity | Portfolio Contact");
    const mailBody = encodeURIComponent(
      `Hi Vishal,\n\nI came across your portfolio and really liked your work.\nI'd love to discuss a potential opportunity with you.\n\nLooking forward to your response.\n\nBest regards,`
    );
    window.location.href = `mailto:${email}?subject=${mailSubject}&body=${mailBody}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section
      id="contact"
      className="min-h-screen w-full flex items-center justify-center px-3  md:px-8 lg:px-12 py-12 md:pt-20 md:pb-36 pb-28"
    >
      <div className="w-full md:max-w-[1400px]">
        <ContactHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <QuickContactCard
              contactOptions={contactOptions}
              socialLinks={socialLinks}
              copied={copied}
              onCopyEmail={handleCopyEmail}
              isDarkMode={isDarkMode}
            />
            
            <DownloadResumeCard isDarkMode={isDarkMode} />
          </div>

          <div className="lg:col-span-2">
            <ContactFormCard
              formData={formData}
              onFormChange={handleChange}
              onSubmit={handleSubmit}
              isDarkMode={isDarkMode}
            />
            
          </div>
        </div>
      </div>
    </section>
  );
}