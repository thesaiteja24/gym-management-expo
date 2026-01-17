import { DraftTemplate, WorkoutTemplate } from "@/stores/template/types";

export function serializeTemplateForApi(
  template: DraftTemplate | WorkoutTemplate,
) {
  return {
    title: template.title, // Title is required for templates usually
    notes: template.notes ?? undefined,

    exerciseGroups: template.exerciseGroups.map((group) => {
      const baseGroup = {
        // If it's a new group in a draft, it has a UUID.
        // If we are updating, we might want to keep the UUID if the backend tracks it.
        // For now, pass ID. Backend can ignore if it's creating new.
        id: group.id,
        groupType: group.groupType,
        groupIndex: group.groupIndex,
      };

      const restProp =
        group.restSeconds !== null && group.restSeconds !== undefined
          ? { restSeconds: Number(group.restSeconds) }
          : {};

      return {
        ...baseGroup,
        ...restProp,
      };
    }),

    exercises: template.exercises.map((exercise) => {
      const baseExercise = {
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseIndex: exercise.exerciseIndex,
      };

      const groupProp = exercise.exerciseGroupId
        ? { exerciseGroupId: exercise.exerciseGroupId }
        : {};

      return {
        ...baseExercise,
        ...groupProp,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          setIndex: set.setIndex,
          setType: set.setType,
          weight: set.weight ? Number(set.weight) : undefined,
          reps: set.reps ? Number(set.reps) : undefined,
          rpe: set.rpe ? Number(set.rpe) : undefined,
          durationSeconds: set.durationSeconds
            ? Number(set.durationSeconds)
            : undefined,
          restSeconds: set.restSeconds ? Number(set.restSeconds) : undefined,
          // Template sets don't usually have 'completed' or 'note' in the same way,
          // but if they did, handle here.
          // TemplateSet type: id, setIndex, setType, weight, reps, rpe, durationSeconds, restSeconds
        })),
      };
    }),
  };
}
