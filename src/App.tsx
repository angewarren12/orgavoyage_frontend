import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Circuits from "./pages/Circuits";
import Sejours from "./pages/Sejours";
import Vols from "./pages/Vols";
import Contact from "./pages/Contact";
import { SearchResultsPage } from './pages/SearchResultsPage';
import { BookingSummaryPage } from './pages/BookingSummaryPage';
import { HotelsPage } from './pages/HotelsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/circuits" element={<Circuits />} />
            <Route path="/sejours" element={<Sejours />} />
            <Route path="/vols" element={<Vols />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/booking-summary" element={<BookingSummaryPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;