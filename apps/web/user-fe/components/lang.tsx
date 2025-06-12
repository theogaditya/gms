"use client";
import { useEffect } from "react";

// Define the google object on the window for TypeScript
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            layout: any;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

export default function LanguageSelector() {
  useEffect(() => {
    // If the script is already there, don't add it again
    if (document.querySelector("script[src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit']")) {
      return;
    }
    
    // Define the initialization function on the window object
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          // Add the languages you want to support
          includedLanguages: "en,hi,ta,te,kn,ml,mr,bn,gu,or,ja,pa,ur,as,ne,zh,ar,fr,de,es,it,pt,ru,vi",
          // This tells Google to only show the dropdown
          layout: (window as any).google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );
    };

    // Create a script element and add it to the page
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
      delete window.googleTranslateElementInit;
    };
  }, []);

  // This is the div where the Google Translate dropdown will be rendered
  return (
     <div className="w-full">
      <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Choose your language from the dropdown below
      </p>
      <div 
        id="google_translate_element" 
        className="inline-block bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-2"
      />
    </div>
  );
}