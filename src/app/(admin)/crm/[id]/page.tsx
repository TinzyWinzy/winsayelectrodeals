"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { Customer } from "@/types";
import type { CustomerNote, CommunicationLog, CommChannel } from "@/types/crm";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [newComm, setNewComm] = useState<{ channel: CommChannel; direction: "inbound" | "outbound"; subject: string; content: string } | null>(null);
  const [savingComm, setSavingComm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/crm?type=customer&customerId=${id}`).then(r => r.json()),
      fetch(`/api/crm?type=notes&customerId=${id}`).then(r => r.json()),
      fetch(`/api/crm?type=communications&customerId=${id}`).then(r => r.json()),
    ]).then(([c, n, comm]) => {
      setCustomer(c);
      setNotes(n);
      setCommunications(comm);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const res = await fetch("/api/crm?type=note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: id, noteType: "general", content: newNote, createdBy: "admin" }),
    });
    const { id: noteId } = await res.json();
    setNotes(prev => [...prev, { id: noteId, customerId: id, noteType: "general", content: newNote, createdBy: "admin", createdAt: new Date().toISOString() } as CustomerNote]);
    setNewNote("");
    setSavingNote(false);
  };

  const handleAddComm = async () => {
    if (!newComm || !newComm.subject) return;
    setSavingComm(true);
    const res = await fetch("/api/crm?type=communication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: id, channel: newComm.channel, direction: newComm.direction, subject: newComm.subject, content: newComm.content, createdBy: "admin" }),
    });
    const { id: commId } = await res.json();
    setCommunications(prev => [...prev, { id: commId, customerId: id, channel: newComm.channel, direction: newComm.direction, subject: newComm.subject, content: newComm.content || null, status: "completed", logMetadata: {}, createdBy: "admin", createdAt: new Date().toISOString() } as CommunicationLog]);
    setNewComm(null);
    setSavingComm(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (!customer) return <p className="text-center text-gray-500 py-20">Customer not found</p>;

  const locationStr = [customer.suburb, customer.city, customer.province].filter(Boolean).join(", ");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button onClick={() => router.push("/crm")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{customer.name || "Unnamed Customer"}</h1>
              <p className="text-sm text-gray-400 font-mono mt-0.5">#{customer.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                <Mail className="w-4 h-4" /> {customer.email}
              </a>
            )}
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                <Phone className="w-4 h-4" /> {customer.phone}
              </a>
            )}
            {locationStr && (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" /> {locationStr}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Notes</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="h-9 text-sm w-48"
                onKeyDown={e => e.key === "Enter" && handleAddNote()}
              />
              <Button size="sm" onClick={handleAddNote} disabled={savingNote || !newNote.trim()}>
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No notes yet</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="border rounded-lg p-3">
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {note.createdBy} &middot; {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Communication Log</CardTitle>
            <Button size="sm" onClick={() => setNewComm({ channel: "phone", direction: "inbound", subject: "", content: "" })}>
              Log Communication
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {newComm && (
              <div className="border border-primary/20 rounded-lg p-3 space-y-2 bg-primary/5">
                <select value={newComm.channel} onChange={e => setNewComm({ ...newComm, channel: e.target.value as CommChannel })}
                  className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm">
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="in-person">In Person</option>
                  <option value="sms">SMS</option>
                  <option value="other">Other</option>
                </select>
                <select value={newComm.direction} onChange={e => setNewComm({ ...newComm, direction: e.target.value as "inbound" | "outbound" })}
                  className="w-full h-9 px-2 rounded-lg border border-gray-300 text-sm">
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
                <Input placeholder="Subject" value={newComm.subject} onChange={e => setNewComm({ ...newComm, subject: e.target.value })} />
                <Input placeholder="Content (optional)" value={newComm.content} onChange={e => setNewComm({ ...newComm, content: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddComm} disabled={savingComm || !newComm.subject}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewComm(null)}>Cancel</Button>
                </div>
              </div>
            )}
            {communications.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No communications logged</p>
            ) : (
              communications.map(comm => (
                <div key={comm.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={comm.direction === "inbound" ? "primary" : "warning"} className="text-[10px] uppercase">
                      {comm.direction}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{comm.channel}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{comm.status}</Badge>
                  </div>
                  <p className="text-sm font-medium">{comm.subject}</p>
                  {comm.content && <p className="text-xs text-gray-500 mt-0.5">{comm.content}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(comm.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
