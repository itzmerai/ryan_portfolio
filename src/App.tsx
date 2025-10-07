import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

// Portfolio Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Certificates from "./pages/Certificates";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Resume from "./pages/Resume";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminContact from "./pages/admin/AdminContact";
import AdminSettings from "./pages/admin/AdminSettings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PortfolioProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Portfolio Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resume" element={<Resume />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/about" element={<AdminAbout />} />
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/contact" element={<AdminContact />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PortfolioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
