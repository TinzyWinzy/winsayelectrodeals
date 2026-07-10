"use client";

import { motion } from "framer-motion";
import { PackageGrid } from "@/components/packages/package-grid";
import { Shield, CreditCard, Wifi, Zap } from "lucide-react";

const features = [
  { icon: Shield, label: "Professional Installation", desc: "All prices include full installation by certified technicians" },
  { icon: CreditCard, label: "Flexible Payment", desc: "Pay after installation available on qualifying tiers" },
  { icon: Wifi, label: "TV Bundle Eligible", desc: "Selected packages include LED TV with DStv/GoTV connection" },
  { icon: Zap, label: "25-Year Warranties", desc: "Tier-1 solar panels with industry-leading performance warranty" },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-3xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 tracking-tight">
              Solar Packages
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              All prices include full installation, inverter, batteries, solar panels,
              and mounting hardware. No hidden fees. Select a package below to get
              your instant quote in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-primary mb-0.5">{f.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <PackageGrid />

          <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="text-sm font-bold text-amber-800 mb-1">Looking for a larger commercial system?</h3>
            <p className="text-sm text-amber-700">
              Contact us directly for custom commercial and industrial solar solutions above 15 kVA.
              Call <a href="tel:+263785293587" className="font-semibold underline">+263 785 293 587</a> or email <a href="mailto:info@winsay.co.zw" className="font-semibold underline">info@winsay.co.zw</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
