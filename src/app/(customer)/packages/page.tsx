"use client";

import { motion } from "framer-motion";
import { PackageGrid } from "@/components/packages/package-grid";
import { Shield, CreditCard, Wifi, Zap, BadgeCheck, MapPin } from "lucide-react";

const features = [
  { icon: Shield, label: "Professional Installation", desc: "All prices include full installation by certified technicians" },
  { icon: CreditCard, label: "Flexible Payment", desc: "Pay after installation available on qualifying tiers" },
  { icon: Wifi, label: "TV Bundle Eligible", desc: "Selected packages include LED TV with DStv/GoTV connection" },
  { icon: Zap, label: "25-Year Warranties", desc: "Tier-1 solar panels with industry-leading performance warranty" },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-ink text-white pt-28 sm:pt-32 pb-12 border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/30 bg-white/8 text-sm font-semibold text-gold-light mb-5">
                <BadgeCheck className="w-4 h-4" />
                Complete installed systems
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
                Solar Packages Built for Serious Backup Power
              </h1>
              <p className="text-white/72 text-lg leading-relaxed mt-5 max-w-2xl">
                Compare installed Winsay systems with panels, inverter, batteries,
                protection kit, mounting kit, voltage switch, and installation included.
              </p>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/8 backdrop-blur-sm p-5">
              <p className="text-sm font-semibold text-gold-light mb-3">Premium buyer assurance</p>
              <div className="space-y-3 text-sm text-white/76">
                <div className="flex gap-2"><Shield className="w-4 h-4 text-gold-light mt-0.5" /> Professional installation included</div>
                <div className="flex gap-2"><CreditCard className="w-4 h-4 text-gold-light mt-0.5" /> Pay-after-install options on qualifying packages</div>
                <div className="flex gap-2"><MapPin className="w-4 h-4 text-gold-light mt-0.5" /> Harare showroom and Zimbabwe-wide enquiries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-gold-light" />
                  </div>
                  <p className="text-sm font-semibold text-primary mb-0.5">{f.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <PackageGrid />

          <div className="mt-12 p-6 bg-white rounded-lg border premium-border premium-shadow">
            <h3 className="text-sm font-bold text-primary mb-1">Looking for a larger commercial system?</h3>
            <p className="text-sm text-gray-600">
              Contact us directly for custom commercial and industrial solar solutions above 15 kVA.
              Call <a href="tel:+263785293587" className="font-semibold underline">+263 785 293 587</a> or email <a href="mailto:info@winsay.co.zw" className="font-semibold underline">info@winsay.co.zw</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
