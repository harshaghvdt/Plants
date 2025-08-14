import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Tweet from "./pages/tweet";
import Verification from "./pages/verification";
import Admin from "./pages/admin";
import Network from "./pages/network";
import Interact from "./pages/interact";
import Create from "./pages/create";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/:username" component={Profile} />
      <Route path="/tweet/:id" component={Tweet} />
      <Route path="/verification" component={Verification} />
      <Route path="/admin" component={Admin} />
      <Route path="/network" component={Network} />
      <Route path="/interact" component={Interact} />
      <Route path="/create" component={Create} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
