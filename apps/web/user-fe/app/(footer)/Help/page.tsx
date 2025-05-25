"use client";
import React, { useEffect } from "react";
import { HelpCircle, PhoneCall, Mail, Info, LifeBuoy, Clock, MapPin } from "lucide-react";

const HelpPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactMethods = [

    {
      icon: <Mail className="w-6 h-6 text-gray-600" />,
      title: "Email Support",
      info: "Send your queries anytime at support@swarajdesk.co.in",
    },
    {
      icon: <Info className="w-6 h-6 text-gray-600" />,
      title: "FAQ",
      info: "Check out our Frequently Asked Questions section for quick answers.",
    },
    {
      icon: <LifeBuoy className="w-6 h-6 text-gray-600" />,
      title: "Live Chat",
      info: "Chat live with our support team from 9 AM to 9 PM every day.",
    },
  ];

  const officeAddress = {
    line1: "SwarajDesk Headquarters",
    line2: "C. V. Raman Global University, Mahura, Bhubaneswar, Odisha",
    line3: "India, 752054",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Need Help? We're Here for You
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-xl mx-auto">
          Whether you have questions, need support, or want to report an issue, our dedicated team is ready to assist you.
          Reach out to us using any of the methods below.
        </p>
      </div>

        {/* additional info */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {contactMethods.map((method, i) => (
          <div
            key={i}
            className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div>{method.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {method.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{method.info}</p>
            </div>
          </div>
        ))}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-gray-600" />
            Office Address
          </h2>
          <address className="not-italic text-gray-700 dark:text-gray-300 space-y-1">
            <p>{officeAddress.line1}</p>
            <p>{officeAddress.line2}</p>
            <p>{officeAddress.line3}</p>
          </address>
        </div>
      </section>

    </div>
  );
};

export default HelpPage;
