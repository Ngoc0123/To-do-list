import { X } from "lucide-react";
import type { TasksViewModel } from "@/hooks/useTasks";

type ProjectModalProps = Pick<
  TasksViewModel,
  | "isProjectModalOpen"
  | "projectForm"
  | "projectErrors"
  | "setProjectField"
  | "closeProjectModal"
  | "handleSubmitProject"
>;

export function ProjectModal(props: ProjectModalProps) {
  if (!props.isProjectModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#2c1a0e]/25 px-4">
      <form onSubmit={props.handleSubmitProject} className="w-full max-w-[560px] rounded-lg border border-[#d9d0c3] bg-[#f2ede4] p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-[#2c1a0e]">New Project</h2>
          <button type="button" aria-label="Close project form" onClick={props.closeProjectModal} className="flex h-8 w-8 items-center justify-center rounded text-[#7f715f] hover:bg-[#ede8df]">
            <X aria-hidden size={18} />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-[#4a3728]">Project Name</span>
          <input
            placeholder="e.g. Website Redesign"
            value={props.projectForm.name}
            onChange={(event) => props.setProjectField("name", event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 text-sm text-[#2c1a0e] outline-none placeholder:text-[#a89880] focus:border-[#b84025]"
          />
        </label>
        {props.projectErrors.name && <p className="mt-1 text-sm text-[#b84025]">{props.projectErrors.name}</p>}

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-[#4a3728]">Project Color</span>
          <input
            type="color"
            value={props.projectForm.color}
            onChange={(event) => props.setProjectField("color", event.target.value)}
            className="mt-2 h-10 w-20 rounded-md border border-[#d9d0c3] bg-[#ede8df] p-1"
          />
        </label>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-[#4a3728]">Description (Optional)</span>
          <textarea
            placeholder="What is this project about?"
            value={props.projectForm.description}
            onChange={(event) => props.setProjectField("description", event.target.value)}
            className="mt-2 min-h-[120px] w-full resize-y rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 py-3 text-sm text-[#2c1a0e] outline-none placeholder:text-[#a89880] focus:border-[#b84025]"
          />
        </label>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={props.closeProjectModal} className="h-10 rounded-md px-6 text-sm font-semibold text-[#4a3728] hover:bg-[#ede8df]">
            Cancel
          </button>
          <button type="submit" className="h-10 rounded-md bg-[#b84025] px-6 text-sm font-semibold text-white hover:bg-[#9f351f]">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
