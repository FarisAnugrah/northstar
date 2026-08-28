"use client";

import { createWorkspace } from "./actions";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  return (
    <form action={createWorkspace} className="mt-6 space-y-4">
      <div>
        <label className="text-sm font-medium">Workspace name</label>
        <input
          name="workspaceName"
          required
          minLength={2}
          maxLength={50}
          defaultValue={defaultName ? `${defaultName}'s workspace` : ""}
          placeholder="Acme Inc."
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can rename this later in settings.
        </p>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg"
      >
        Create workspace
      </button>
    </form>
  );
}
