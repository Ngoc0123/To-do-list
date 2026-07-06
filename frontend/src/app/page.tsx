"use client";

import { Pagination } from "@/components/tasks/Pagination";
import { ProjectModal } from "@/components/tasks/ProjectModal";
import { TaskDashboardHeader } from "@/components/tasks/TaskDashboardHeader";
import { TaskFeed } from "@/components/tasks/TaskFeed";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskSidebar } from "@/components/tasks/TaskSidebar";
import { getEmptyTaskMessage } from "@/components/tasks/taskDisplay";
import { useTasks } from "@/hooks/useTasks";

export default function TaskDashboard() {
  const state = useTasks();
  const pageTitle = state.selectedProject?.name ?? "All Tasks";
  const pageDescription = state.selectedProject?.description;
  const emptyTaskState = getEmptyTaskMessage({
    totalElements: state.totalElements,
    search: state.search,
    selectedProject: state.selectedProject,
    statusFilter: state.statusFilter,
    dateFilter: state.dateFilter,
    statusMessage: state.statusMessage
  });

  return (
    <main className="min-h-screen bg-[#f2ede4] text-[#2c1a0e] lg:flex">
      <TaskSidebar
        projects={state.projects}
        totalElements={state.totalElements}
        selectedProjectId={state.selectedProjectId}
        onSelectProject={state.setSelectedProjectId}
        onOpenProject={() => state.setIsProjectModalOpen(true)}
        onDeleteProject={state.handleDeleteProject}
      />

      <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <TaskDashboardHeader
          title={pageTitle}
          description={pageDescription}
          selectedProject={state.selectedProject}
          onCreateTask={state.openCreateTaskModal}
          onDeleteProject={state.handleDeleteProject}
        />

        <TaskFilters
          search={state.search}
          statusFilter={state.statusFilter}
          dateFilter={state.dateFilter}
          sort={state.sort}
          onSearchChange={state.handleSearchChange}
          onStatusFilterChange={state.handleStatusFilterChange}
          onDateFilterChange={state.setDateFilter}
          onSortChange={state.setSort}
        />

        <TaskFeed
          tasks={state.displayedTasks}
          isLoading={state.isLoading}
          emptyState={emptyTaskState}
          onToggle={state.handleToggle}
          onEdit={state.openEditTaskModal}
          onDelete={state.handleDelete}
        />

        <Pagination page={state.page} totalPages={state.totalPages} onPageChange={state.setPage} />
      </section>

      <TaskModal
        taskModalMode={state.taskModalMode}
        taskForm={state.taskForm}
        projects={state.projects}
        errorMessages={state.errorMessages}
        setTaskField={state.setTaskField}
        closeTaskModal={state.closeTaskModal}
        handleSubmitTask={state.handleSubmitTask}
      />
      <ProjectModal
        isProjectModalOpen={state.isProjectModalOpen}
        projectForm={state.projectForm}
        projectErrors={state.projectErrors}
        setProjectField={state.setProjectField}
        closeProjectModal={state.closeProjectModal}
        handleSubmitProject={state.handleSubmitProject}
      />
    </main>
  );
}
