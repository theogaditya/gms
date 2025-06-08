"use client";

import { Button } from "@/components/ui/button";

interface CtaProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

export const Cta = ({
  heading = "Raise Your Voice Today",
  description = "Register your complaint in just a few clicks and help make your community better. Your voice matters.",
  buttons = {
    primary: {
      text: "Register a Complaint",
      url: "/regcomplaint",
    },
    secondary: {
      text: "Log In",
      url: "/auth/login",
    },
  },
}: CtaProps) => {
  return (
    <section className="w-full py-35 bg-muted/30 text-center">
      <div className="px-6 max-w-4xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          {heading}
        </h3>
        <p className="text-muted-foreground text-lg md:text-xl mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {buttons.secondary && (
            <Button
            variant="outline"
            className="sm:min-w-[200px] border-black text-black hover:bg-black hover:text-white"
            asChild
            >
            <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
            </Button>
        )}
        {buttons.primary && (
            <Button
            className="sm:min-w-[200px] bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black"
            asChild
            >
            <a href={buttons.primary.url}>{buttons.primary.text}</a>
            </Button>
        )}
        </div>
      </div>
    </section>
  );
};
