"use client";

import { ArrowLeft, FileText, ImageIcon, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Vault() {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'history'>('all');

  // Placeholder data
  const vaultItems = [
    { id: 1, type: "document", title: "Ration Card Application", date: "Today, 10:30 AM", icon: <FileText size={24} /> },
    { id: 2, type: "history", title: "Explained: PM-Kisan Scheme", date: "Yesterday", icon: <Search size={24} /> },
    { id: 3, type: "document", title: "Uploaded Notice Photo", date: "Mar 15", icon: <ImageIcon size={24} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6 flex gap-4 items-center">
        <Link href="/">
          <button className="neumorphic-button p-3 focus-ring">
            <ArrowLeft size={24} className="text-textMain" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-wide">Document Vault</h1>
          <p className="text-textMuted text-xs">Your Saved Forms & History</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {['all', 'documents', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'all' | 'documents' | 'history')}
            className={`px-4 py-2 rounded-full font-semibold capitalize text-sm transition-all shadow-neumorphic ${activeTab === tab ? 'bg-primary text-[#0A192F] shadow-none' : 'bg-card text-textMuted'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 space-y-4">
        {vaultItems.filter(item => activeTab === 'all' || item.type === activeTab).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="neumorphic-card p-4 flex gap-4 items-center"
          >
            <div className="bg-[#112240] p-3 rounded-xl shadow-neumorphic-inset text-primary">
              {item.icon}
            </div>
            <div>
              <h3 className="text-textMain font-semibold text-md">{item.title}</h3>
              <p className="text-textMuted text-xs mt-1">{item.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Offline Notice */}
      <div className="text-center mt-6 text-xs text-textMuted">
        Available Offline via SETU Sync
      </div>
    </div>
  );
}
