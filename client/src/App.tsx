import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const UsersPage = lazy(() => import("@/pages/users"));
const ToolsPage = lazy(() => import("@/pages/tools"));
const VpsPage = lazy(() => import("@/pages/vps"));
const ProxiesPage = lazy(() => import("@/pages/proxies"));
const TransactionsPage = lazy(() => import("@/pages/transactions"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const NotFound = lazy(() => import("@/pages/not-found"));
const LoginPage = lazy(() => import("@/pages/login"));

// Loading component for suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-muted-foreground">Đang tải...</div>
  </div>
);

function DashboardLayout() {
  const { user, logout } = useAuth();
  
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Xin chào, <strong>{user?.username}</strong>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<LoadingComponent />}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/users" component={UsersPage} />
                <Route path="/tools" component={ToolsPage} />
                <Route path="/vps" component={VpsPage} />
                <Route path="/proxies" component={ProxiesPage} />
                <Route path="/transactions" component={TransactionsPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <Suspense fallback={<LoadingComponent />}>
          <LoginPage />
        </Suspense>
      </Route>
      <Route>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
