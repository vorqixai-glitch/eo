import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plug, Globe, Terminal, FileCode2, Database, Shield, Zap } from "lucide-react";

export type PluginMeta = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
};

export const AVAILABLE_PLUGINS: PluginMeta[] = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Access live internet data via DuckDuckGo & Wikipedia.",
    icon: Globe,
  },
  {
    id: "run_javascript",
    name: "Code Executor",
    description: "Sandboxed JavaScript execution environment.",
    icon: Terminal,
  },
  {
    id: "fetch_url",
    name: "URL Reader",
    description: "Fetch and read text from external URLs.",
    icon: FileCode2,
  },
  {
    id: "db_connector",
    name: "DB Connector",
    description: "Connect to databases (Postgres, Firebase).",
    icon: Database,
  },
  {
    id: "sec_scanner",
    name: "Security Scanner",
    description: "Run automated security vulnerability checks.",
    icon: Shield,
  },
  {
    id: "performance",
    name: "Performance Profiler",
    description: "Analyze frontend bundle sizes and latency.",
    icon: Zap,
  },
];

export function SkillConnectors({
  enabledPlugins,
  setEnabledPlugins,
}: {
  enabledPlugins: string[];
  setEnabledPlugins: (plugins: string[]) => void;
}) {
  const togglePlugin = (id: string) => {
    if (enabledPlugins.includes(id)) {
      setEnabledPlugins(enabledPlugins.filter((p) => p !== id));
    } else {
      setEnabledPlugins([...enabledPlugins, id]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Plug className="h-3.5 w-3.5" />
          <span>Plugins ({enabledPlugins.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            Skill Connectors
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-4">
          {AVAILABLE_PLUGINS.map((plugin) => {
            const Icon = plugin.icon;
            const isActive = enabledPlugins.includes(plugin.id);
            return (
              <div
                key={plugin.id}
                className="flex items-center justify-between space-x-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{plugin.name}</p>
                    <p className="text-[11px] text-muted-foreground">{plugin.description}</p>
                  </div>
                </div>
                <Switch checked={isActive} onCheckedChange={() => togglePlugin(plugin.id)} />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
