import { TemplatePayload } from "@/lib/sync/types";
import { DraftTemplate } from "@/stores/template/types";

export function serializeTemplateForApi(
  template: DraftTemplate & { sourceShareId?: string; authorName?: string },
): TemplatePayload {
  return {
    id: template.id,
    clientId: template.clientId,
    title: template.title,
    notes: template.notes ?? undefined,
    sourceShareId: template.sourceShareId,
    authorName: template.authorName,

    exerciseGroups: template.exerciseGroups.map((group) => {
      const baseGroup = {
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
          setIndex: set.setIndex,
          setType: set.setType,
          weight: set.weight ? Number(set.weight) : undefined,
          reps: set.reps ? Number(set.reps) : undefined,
          rpe: set.rpe ? Number(set.rpe) : undefined,
          durationSeconds: set.durationSeconds
            ? Number(set.durationSeconds)
            : undefined,
          restSeconds: set.restSeconds ? Number(set.restSeconds) : undefined,
          note: set.note ?? undefined,
        })),
      };
    }),
  };
}
