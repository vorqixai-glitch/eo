import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/projects.functions";
import { getMergedPersonas } from "@/lib/personas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Folder,
  Bot,
  Sparkles,
  MessageSquare,
  Plus,
  Activity,
  Clock,
  Cpu,
  Leaf,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const personas = getMergedPersonas();
  const swarmAgents = personas.filter(
    (p) =>
      p.swarm ||
      p.id === "kimi" ||
      p.id.startsWith("claude") ||
      p.id.startsWith("grok") ||
      p.id.startsWith("chatgpt") ||
      p.id === "fable5",
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moss Intelligence</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your workspaces, projects, and autonomous swarms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                New Chat
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-primary">
                <Folder className="mr-2 h-4 w-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : projects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Cross-functional workspaces</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                <Bot className="mr-2 h-4 w-4" />
                Swarm Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{swarmAgents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Specialized AI personas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                <Activity className="mr-2 h-4 w-4" />
                Skill Connectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">6</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active integrations (DB, Web, Code)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-lg border bg-card animate-pulse"></div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Folder className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No projects yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                    Create a project to organize your chats, set global system prompts, and manage
                    artifacts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.slice(0, 5).map((project) => (
                  <Card
                    key={project.id}
                    className="group hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="truncate">{project.name}</span>
                        <Badge variant="secondary" className="font-normal text-[10px]">
                          Active
                        </Badge>
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link to="/chat">Open Chat</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Swarm Agents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Swarm & Leading Models</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {swarmAgents.slice(0, 8).map((agent) => (
                <Card key={agent.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                        {agent.emoji}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm leading-none">{agent.name}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {agent.tagline}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
