import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminGuard from "./components/AdminGuard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary">
          <Switch>
            <Route path="/admin">
              <AdminGuard>
                <Admin />
              </AdminGuard>
            </Route>
            <Route component={MainLayout} />
          </Switch>
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
