"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Sun, Clock, Sparkles, Star, CheckCircle, Users, Award, MapPin, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const steps = [
  {
    icon: Sun,
    title: "Choose Package",
    desc: "Browse 8 solar tiers and pick your fit",
    color: "from-primary to-primary-light",
  },
  {
    icon: Zap,
    title: "Instant Quote",
    desc: "Fill in details, get a quote in seconds",
    color: "from-primary-light to-primary",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    desc: "Pay with EcoCash, InnBucks, or PayNow",
    color: "from-secondary to-secondary-light",
  },
  {
    icon: Clock,
    title: "Installation",
    desc: "Schedule install within 48 hours",
    color: "from-secondary-light to-secondary",
  },
];

const testimonials = [
  {
    name: "Tendai M.",
    location: "Harare",
    text: "I visited their shop at Copacabbana and the team walked me through every option. My 3.5Kva system was installed within 2 days and I haven't had a single power issue since. The Pay After Install option made it possible for me.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    location: "Bulawayo",
    text: "Professional installation from start to finish. They explained everything clearly, the pricing was exactly as quoted — no hidden fees. My 8.2Kva system runs the whole house including my borehole pump. Highly recommended.",
    rating: 5,
  },
  {
    name: "Tafadzwa C.",
    location: "Mutare",
    text: "I was sceptical about online quotes but they were spot on. Visited their showroom, saw the systems running, and made my decision. The 10.2Kva WiFi system lets me monitor everything from my phone. Best investment I've made.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ───── HERO ───── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/8kva10.2kvasystem.jpg"
            alt="Solar panel installation"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Zimbabwe&apos;s Trusted Solar Installer
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white">
              Solar Power for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                Every Home
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              Get an instant solar quote in under 3 minutes. No site visit needed.
              Pay after installation options available. Trusted by over 500 Zimbabwean
              homes and businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/packages"
                className={buttonVariants({ variant: "secondary", size: "lg", className: "shadow-lg hover:shadow-xl transition-shadow" })}
              >
                Get Instant Quote
                <Zap className="w-5 h-5" />
              </Link>
              <Link
                href="/packages"
                className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 text-white hover:bg-white/10 hover:border-white/50" })}
              >
                View Packages
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/60">
                <span className="text-white font-semibold">500+</span> homes powered
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section className="py-10 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Award, label: "25-Year Warranties", desc: "On all panels" },
              { icon: Users, label: "500+ Installations", desc: "Across Zimbabwe" },
              { icon: Clock, label: "48-Hour Install", desc: "After deposit" },
              { icon: Shield, label: "Fully Licensed", desc: "ZERA certified" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-primary">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="py-20 sm:py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              From choice to installation in four simple steps
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 bg-gradient-to-b from-white to-gray-50/50">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                        style={{ backgroundImage: `linear-gradient(135deg, var(--primary), var(--primary-light))` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="relative">
                        <span className="absolute -top-1 -right-4 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ───── INSTALLATION SHOWCASE ───── */}
      <section className="py-20 bg-gray-50" id="installations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 tracking-tight">
              Our Installations
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Real systems installed for Zimbabwean homes and businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "/3kvasystem.jpg", label: "3 kVA Home System", desc: "Essential backup for lighting and appliances", href: "/packages" },
              { src: "/8kva10.2kvasystem.jpg", label: "8 kVA Residential", desc: "Full home backup with battery storage", href: "/packages" },
              { src: "/102kva12kvasystem.jpg", label: "102 kVA Commercial", desc: "Large-scale commercial installation", href: "/packages" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="group relative overflow-hidden rounded-xl shadow-md bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.label}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-primary mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Real feedback from real Zimbabwean homeowners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 bg-gradient-to-b from-white to-gray-50/50 shadow-md">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{t.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ABOUT US ───── */}
      <section className="py-20 bg-gray-50" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight">
                About Winsay Electrodeals
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are a Zimbabwean-owned solar energy company based in Harare,
                dedicated to making solar power accessible to every home and
                business. Our mission is simple: provide high-quality solar
                systems at honest prices, with flexible payment options.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                With over 500 installations completed across all ten provinces,
                our team of certified technicians ensures every system is
                installed professionally and on time. We partner with trusted
                brands including SUMRY, Deye, and SRNE to deliver reliable
                solar solutions backed by full warranties.
              </p>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: "ZERA licensed and insured" },
                  { icon: CheckCircle, text: "Over 5 years of solar installation experience" },
                  { icon: CheckCircle, text: "Genuine Tier-1 components with full warranties" },
                  { icon: CheckCircle, text: "No hidden fees — what you see is what you pay" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call Us</p>
                    <a href="tel:+263785293587" className="text-sm font-semibold text-primary hover:underline">+263 785 293 587</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Visit Our Shop</p>
                    <p className="text-sm font-semibold text-primary">Shop 23B, Copacabbana Mall, Harare</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/team.jpg"
                  alt="Our installation team"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-64 rounded-xl overflow-hidden shadow-md mt-8">
                <Image
                  src="/team2.jpg"
                  alt="Winsay Electrodeals team"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── PAY AFTER INSTALL ───── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-light p-8 sm:p-12 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Pay After Installation
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                On qualifying tiers, you only pay a deposit upfront. Pay the
                balance after your system is installed and working.
              </p>
              <Link
                href="/packages"
                className={buttonVariants({ variant: "secondary", size: "lg", className: "shadow-lg" })}
              >
                See Eligible Packages
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── VISIT OUR SHOP ───── */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3 tracking-tight">
              Visit Our Showroom
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-6">
              Come see our systems in person and get expert advice from our team.
            </p>
            <div className="inline-flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
              <MapPin className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm font-medium text-primary">Shop 23B, Copacabbana Mall, 1st Entrance, Cameroon Street, Harare</span>
            </div>
            <div className="mt-6">
              <a
                href="tel:+263785293587"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Call Now: +263 785 293 587
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
