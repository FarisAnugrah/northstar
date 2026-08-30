"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createProject } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-soft hover:bg-primary-hover transition-colors disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create project"}
    </button>
  );
}

export function NewProjectForm() {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setError(null);
        try {
          await createProject(formData);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Project name <span className="text-accent-rose">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="e.g. Customer Portal"
          className="mt-1 w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label htmlFor="industry" className="text-sm font-medium">
          Industry
        </label>
        <input
          id="industry"
          name="industry"
          minLength={2}
          maxLength={50}
          placeholder="e.g. B2B SaaS"
          className="mt-1 w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          placeholder="Short summary of the project..."
          className="mt-1 w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      {error && <p className="text-sm text-accent-rose">{error}</p>}

      <SubmitButton />
    </form>
  );
}
