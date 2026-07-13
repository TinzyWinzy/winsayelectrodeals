"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { Customer } from "@/types";

export default function CrmPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/crm?type=customers")
      .then(r => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  const locationStr = (c: Customer) => [c.suburb, c.city, c.province].filter(Boolean).join(", ");

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-primary">Customer Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Loading..." : `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-400 py-12">
                    <p className="text-sm">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(c => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/crm/${c.id}`)}>
                    <TableCell>
                      <p className="text-sm font-medium text-primary">{c.name || "Unnamed"}</p>
                      <p className="text-xs text-gray-400 font-mono">#{c.id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary" onClick={e => e.stopPropagation()}>
                            <Mail className="w-3.5 h-3.5" /> {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary" onClick={e => e.stopPropagation()}>
                            <Phone className="w-3.5 h-3.5" /> {c.phone}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {locationStr(c) ? (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" /> {locationStr(c)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
