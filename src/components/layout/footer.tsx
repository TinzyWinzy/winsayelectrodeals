import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  products: [
    { label: "3 kVA Starter", href: "/packages" },
    { label: "5 kVA Essential", href: "/packages" },
    { label: "8 kVA Popular", href: "/packages" },
    { label: "10 kVA Premium", href: "/packages" },
  ],
  company: [
    { label: "About Us", href: "/#about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Installations", href: "/#installations" },
    { label: "Packages", href: "/packages" },
    { label: "Get a Quote", href: "/quote" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/15 flex items-center justify-center shadow-sm ring-1 ring-white/10">
                <Image
                  src="/logo.jpg"
                  alt="Winsay Electrodeals"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Winsay</span>
                <span className="text-[10px] font-medium text-white/50 block leading-none -mt-0.5">
                  Electrodeals
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-5">
              Trusted solar energy solutions for Zimbabwean homes and businesses.
              Affordable pricing, professional installation, 25-year warranties.
            </p>
            <div className="space-y-2">
              <a href="tel:+263785293587" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +263 785 293 587
              </a>
              <a href="mailto:info@winsay.co.zw" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
                info@winsay.co.zw
              </a>
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Shop 23B, Copacabbana Mall, 1st Entrance, Cameroon Street, Harare</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Products
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Get Started
            </h4>
            <p className="text-sm text-white/60 mb-4">
              Find the perfect solar package for your home in under 2 minutes.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Free Instant Quote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Winsay Electrodeals. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by the sun</span>
            <span className="text-yellow-400">&#9788;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
