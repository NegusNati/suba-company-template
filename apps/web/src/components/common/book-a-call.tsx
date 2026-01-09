import { Link } from "@tanstack/react-router";

import ShinyText from "./shinny-text";

import googleMeet from "@/assets/external-company-logos/google-meet.svg";
import { Button } from "@/components/ui/button";

export default function BookACall() {
  return (
    <section className="w-full py-16">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-2xl py-16 md:py-24 px-8 text-center text-white overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Main Heading */}
            <ShinyText
              text="Start Your New Project Today!"
              disabled={false}
              speed={4}
              className="text-xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text "
            />

            {/* Subheading */}
            <p className="text-sm md:text- text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
              Experience World-Class Software, Construction, And Design
              Delivered At Startup Speed. Schedule A Call Today.
            </p>

            {/* Primary CTA Button (Shadcn Button) */}
            <Link
              to="/demo/schedule"
              className="mb-4"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              <Button
                variant="secondary"
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:bg-primary-foreground/95 transition-colors duration-300 hover:shadow-lg cursor-pointer hover:scale-103"
              >
                <img src={googleMeet} alt="Google Meet" className="w-5 h-5" />
                Book a Call
              </Button>
            </Link>

            {/* "Or" Divider */}
            <p className="text-white/70 text-sm my-2">Or</p>

            {/* Secondary Link */}
            <Link
              to="/demo/contact"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="text-white underline underline-offset-2 hover:text-white/80 transition-colors text-sm cursor-pointer"
            >
              Book a services quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
