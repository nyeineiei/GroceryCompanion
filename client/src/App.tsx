import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CustomerOrders from "@/pages/customer/orders";
import CustomerHistory from "@/pages/customer/history";
import ShopperDashboard from "@/pages/shopper/dashboard";
import ShopperHistory from "@/pages/shopper/history";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <ProtectedRoute path="/orders" component={CustomerOrders} />
      <ProtectedRoute path="/dashboard" component={ShopperDashboard} />
      <ProtectedRoute path="/customer/history" component={CustomerHistory} />
      <ProtectedRoute path="/shopper/history" component={ShopperHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;