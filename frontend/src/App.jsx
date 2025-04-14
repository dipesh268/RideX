
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RideProvider } from "./context/RideContext";
import { lazy, Suspense, useEffect } from "react";
import AnimatedTransition from "./components/AnimatedTransition";
import ConnectionStatus from "./components/ConnectionStatus";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const RiderDashboard = lazy(() => import("./pages/RiderDashboard"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const ScheduledRides = lazy(() => import("./components/ScheduleRide"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create a wrapper component for scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RideProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ConnectionStatus />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<AnimatedTransition><Index /></AnimatedTransition>} />
              <Route path="/login" element={<AnimatedTransition><Login /></AnimatedTransition>} />
              <Route path="/rider/*" element={<AnimatedTransition><RiderDashboard /></AnimatedTransition>} />
              <Route path="/driver/*" element={<AnimatedTransition><DriverDashboard /></AnimatedTransition>} />
              <Route path="/scheduled-rides" element={<AnimatedTransition><ScheduledRides /></AnimatedTransition>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </RideProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
