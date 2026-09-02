import Link from "next/link";
import { CheckCircle2, FileText, Zap, Shield, FileCheck, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Northstar</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#templates" className="hover:text-foreground transition-colors">Templates</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-soft hover:bg-primary/90 transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet font-medium text-sm mb-8 border border-accent-violet/20">
              <Zap className="w-4 h-4" /> Generative AI for Product Teams
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
              Generate Product Documents in <span className="text-primary">Minutes</span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stop fighting with blank pages. Automate the creation of PRDs, BRDs, and Technical Specs 
              using AI tailored for B2B SaaS teams.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary text-primary-foreground text-lg rounded-xl font-bold shadow-lift hover:bg-primary-hover hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Generate Document Now
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 sm:mt-0">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Mockup / Dashboard Preview */}
            <div className="mt-20 mx-auto max-w-5xl rounded-2xl border border-border shadow-2xl overflow-hidden bg-surface relative">
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10"></div>
              <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-8 text-left grid md:grid-cols-3 gap-6 relative">
                <div className="col-span-1 border-r border-border pr-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted/50 rounded-lg"></div>
                  <div className="h-10 bg-muted/50 rounded-lg"></div>
                  <div className="h-10 bg-primary/10 rounded-lg border border-primary/20"></div>
                </div>
                <div className="col-span-2 space-y-6">
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/60 rounded w-full"></div>
                    <div className="h-4 bg-muted/60 rounded w-5/6"></div>
                    <div className="h-4 bg-muted/60 rounded w-4/6"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-32 bg-muted/30 rounded-xl border border-border"></div>
                    <div className="h-32 bg-muted/30 rounded-xl border border-border"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / How it works */}
        <section id="features" className="py-24 bg-surface border-y border-border px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">How Northstar Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">From a brief idea to a stakeholder-ready document.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Complete Intake</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fill out a short, guided form about your project&apos;s problem, users, and goals.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-accent-violet/10 text-accent-violet rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. AI Generation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our fine-tuned LLM instantly writes professional, structured requirements section by section.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-accent-emerald/10 text-accent-emerald rounded-2xl flex items-center justify-center mb-6">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Export & Share</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Review the draft, edit using our rich-text editor, and export as PDF or Word (DOCX).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Documents */}
        <section id="templates" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Documents we generate</h2>
              <p className="mt-4 text-lg text-muted-foreground">Standardized structures for every stage of software development.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "PRD", name: "Product Requirements", desc: "User stories, features, and success metrics for product teams." },
                { title: "BRD", name: "Business Requirements", desc: "Business goals, scope, and rules for executive stakeholders." },
                { title: "FSD", name: "Functional Specs", desc: "Detailed use cases, validations, and edge cases for engineering." },
                { title: "TSD", name: "Technical Specs", desc: "Architecture, database design, and API specs for developers." },
                { title: "SRS", name: "Software Requirements", desc: "Comprehensive functional and non-functional requirements." },
                { title: "PCR", name: "Project Change Request", desc: "Scope adjustments, impact analysis, and justifications." },
              ].map((doc) => (
                <div key={doc.title} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-muted px-3 py-1 rounded-md text-sm font-bold text-foreground">{doc.title}</span>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{doc.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">N</span>
            </div>
            <span className="font-bold text-foreground">Northstar</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="mailto:support@northstar.ai" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Northstar AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
