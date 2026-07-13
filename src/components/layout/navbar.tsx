"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/packages", label: "Packages" },
  { href: "/solar-finder", label: "Find My System" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About" },
  { href: "/#installations", label: "Installations" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm ${
            scrolled
              ? "ring-1 ring-gray-200"
              : "bg-white/15 backdrop-blur-sm"
          }`}>
            <Image
              src="/logo.jpg"
              alt="Winsay Electrodeals"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-primary" : "text-white"
            }`}>
              Winsay
            </span>
            <span className={`text-[10px] font-medium block leading-none -mt-0.5 transition-colors duration-300 ${
              scrolled ? "text-gray-400" : "text-white/60"
            }`}>
              Electrodeals
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scrolled
                  ? "text-gray-600 hover:text-primary hover:bg-gray-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="tel:+263785293587" className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5" />
            +263 785 293 587
          </Link>
          <div className="w-px h-6 bg-gray-200/20 mx-1 hidden lg:block" />
          <Link href="/packages">
            <Button variant={scrolled ? "primary" : "secondary"} size="sm" className="transition-all duration-300">
              Get Free Quote
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            scrolled ? "text-gray-500 hover:text-primary hover:bg-gray-100" : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                <a href="tel:+263785293587" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                  +263 785 293 587
                </a>
                <Link href="/packages" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Free Quote
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
