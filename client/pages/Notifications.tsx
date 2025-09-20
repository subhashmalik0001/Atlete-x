import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotifications, markAllRead, NotificationItem, saveNotifications } from "@/lib/user";
import { Bell, Check, Info, MapPin, Trophy } from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    setItems(getNotifications());
  }, []);

  const markRead = (id: string) => {
    const next = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    setItems(next);
    saveNotifications(next);
  };

  const markAll = () => setItems(markAllRead());

  const filtered = items.filter((n) => (filter === "unread" ? !n.read : true));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Center</span>
            <div className="flex items-center gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
              <Button variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>Unread</Button>
              <Button variant="secondary" onClick={markAll} className="gap-2"><Check className="h-4 w-4" /> Mark all read</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No notifications.</div>
          )}
          {filtered.map((n) => (
            <div key={n.id} className={`rounded-md border p-3 flex items-start justify-between ${n.read?"opacity-70":""}`}>
              <div className="flex items-start gap-3">
                <Icon type={n.type} />
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</div>
                </div>
              </div>
              {!n.read && <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Mark read</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Icon({ type }: { type?: string }) {
  if (type === "rank") return <Trophy className="h-5 w-5 text-amber-500" />;
  if (type === "trial") return <MapPin className="h-5 w-5 text-emerald-500" />;
  if (type === "update") return <Info className="h-5 w-5 text-sky-500" />;
  return <Bell className="h-5 w-5 text-brand-500" />;
}
