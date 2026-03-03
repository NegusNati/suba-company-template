import { Check, Mail, MapPin, Phone, Zap } from "lucide-react";

export function ContactCTAInfoPanel() {
  return (
    <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 text-white min-h-[400px]">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight tracking-tight mb-6 mt-8 sm:mt-0">
        Let&apos;s talk
      </h2>

      <div className="space-y-5 hidden sm:block">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Learn how we can transform your business with tailored solutions
              and flexible pricing options.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Experience firsthand how our platform accelerates delivery &amp;
              drives results.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/20 space-y-4">
        <div className="flex items-center gap-3 text-white/80">
          <Phone className="w-4 h-4" />
          <span className="text-sm">+ 251 90 000 0000</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <Mail className="w-4 h-4" />
          <span className="text-sm">contact@example.com</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </div>
  );
}
