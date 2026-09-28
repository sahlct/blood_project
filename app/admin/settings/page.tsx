"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Shield, Bell, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, newValue: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
    );
  };

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
      }
    } catch (err) {
      console.error("Failed to save setting:", err);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          System & Eligibility Configuration
        </h2>
        <p className="text-sm text-slate-500">
          Centralized database-driven configuration. Avoid hardcoded intervals and customize portal rules.
        </p>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.key} className="border-slate-200 shadow-xs">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {setting.key}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Group: {setting.group}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {setting.description || "System configuration parameter"}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  value={setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="h-9 w-full sm:w-64 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingKey === setting.key}
                  onClick={() => handleSave(setting.key, setting.value)}
                  className="gap-1.5 shrink-0"
                >
                  {savedKey === setting.key ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Save className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{savedKey === setting.key ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
