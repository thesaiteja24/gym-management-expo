import { zustandStorage } from "@/lib/storage";
import {
  createTemplateService,
  deleteTemplateService,
  getAllTemplatesService,
  updateTemplateService,
} from "@/services/templateService";
import { serializeTemplateForApi } from "@/utils/template";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TemplateExercise, TemplateSet, TemplateState } from "./template/types";
import { useWorkout } from "./workoutStore";

// Initial State
const initialState = {
  templates: [],
  templateLoading: false,
  draftTemplate: null,
};

export const useTemplate = create<TemplateState>()(
  persist(
    (set, get) => ({
      ...initialState,

      getAllTemplates: async () => {
        set({ templateLoading: true });
        try {
          const res = await getAllTemplatesService();
          if (res.success) {
            set({ templates: res.data || [] });
          }
        } catch (e) {
          console.error("Failed to fetch templates", e);
        } finally {
          set({ templateLoading: false });
        }
      },

      createTemplate: async (data) => {
        set({ templateLoading: true });
        try {
          const payload = serializeTemplateForApi(data);
          const res = await createTemplateService(payload);
          if (res.success) {
            // Optimistic or Refetch
            get().getAllTemplates();
            return { success: true };
          }
          return res;
        } catch (e) {
          return { success: false, error: e };
        } finally {
          set({ templateLoading: false });
        }
      },

      updateTemplate: async (id, data) => {
        set({ templateLoading: true });
        try {
          const payload =
            "exercises" in data ? serializeTemplateForApi(data as any) : data;

          // @ts-ignore
          const res = await updateTemplateService(id, payload);
          if (res.success) {
            const updated = res.data;
            set((state) => ({
              templates: state.templates.map((t) =>
                t.id === id ? updated : t,
              ),
            }));
            return { success: true };
          }
          return res;
        } catch (e) {
          return { success: false, error: e };
        } finally {
          set({ templateLoading: false });
        }
      },

      deleteTemplate: async (id) => {
        set({ templateLoading: true });
        try {
          // Optimistic update
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          }));
          await deleteTemplateService(id);
        } catch (e) {
          // Revert? For now just log
          console.error("Failed to delete template", e);
        } finally {
          set({ templateLoading: false });
        }
      },

      startWorkoutFromTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        const { loadTemplate } = useWorkout.getState();
        loadTemplate(template);
        router.push("/(app)/workout/start");
      },

      /* ───── Draft Actions ───── */

      startDraftTemplate: (initialData) => {
        set({
          draftTemplate: {
            title: "",
            userId: "", // Placeholder
            exercises: [],
            exerciseGroups: [],
            ...initialData,
          },
        });
      },

      updateDraftTemplate: (patch) => {
        const draft = get().draftTemplate;
        if (!draft) return;
        set({ draftTemplate: { ...draft, ...patch } });
      },

      discardDraftTemplate: () => {
        set({ draftTemplate: null });
      },

      addExerciseToDraft: (exerciseId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercise: TemplateExercise = {
          id: Crypto.randomUUID(),
          exerciseId,
          exerciseIndex: draft.exercises.length,
          sets: [],
        };

        set({
          draftTemplate: {
            ...draft,
            exercises: [...draft.exercises, newExercise],
          },
        });
      },

      removeExerciseFromDraft: (exerciseId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercises = draft.exercises
          .filter((e) => e.exerciseId !== exerciseId)
          .map((e, index) => ({ ...e, exerciseIndex: index }));

        set({
          draftTemplate: {
            ...draft,
            exercises: newExercises,
          },
        });
      },

      replaceDraftExercise: (oldId, newId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercises = draft.exercises.map((e) =>
          e.exerciseId === oldId ? { ...e, exerciseId: newId } : e,
        );

        set({
          draftTemplate: { ...draft, exercises: newExercises },
        });
      },

      reorderDraftExercises: (ordered) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        set({
          draftTemplate: {
            ...draft,
            exercises: ordered.map((e, index) => ({
              ...e,
              exerciseIndex: index,
            })),
          },
        });
      },

      addSetToDraft: (exerciseId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercises = draft.exercises.map((e) => {
          if (e.exerciseId === exerciseId) {
            const newSet: TemplateSet = {
              id: Crypto.randomUUID(),
              setIndex: e.sets.length,
              setType: "working",
              weight: undefined,
              reps: undefined,
              rpe: undefined,
              durationSeconds: undefined,
              restSeconds: undefined,
            };
            return {
              ...e,
              sets: [...e.sets, newSet],
            };
          }
          return e;
        });

        set({
          draftTemplate: {
            ...draft,
            exercises: newExercises,
          },
        });
      },

      updateDraftSet: (exerciseId, setId, patch) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercises = draft.exercises.map((e) => {
          if (e.exerciseId !== exerciseId) return e;

          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
          };
        });

        set({
          draftTemplate: { ...draft, exercises: newExercises },
        });
      },

      removeSetFromDraft: (exerciseId, setId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const newExercises = draft.exercises.map((e) => {
          if (e.exerciseId !== exerciseId) return e;

          return {
            ...e,
            sets: e.sets
              .filter((s) => s.id !== setId)
              .map((s, idx) => ({ ...s, setIndex: idx })),
          };
        });

        set({
          draftTemplate: { ...draft, exercises: newExercises },
        });
      },

      createDraftExerciseGroup: (exerciseIds, type) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        const groupId = Crypto.randomUUID();

        set({
          draftTemplate: {
            ...draft,
            exerciseGroups: [
              ...draft.exerciseGroups,
              {
                id: groupId,
                groupType: type,
                groupIndex: draft.exerciseGroups.length,
                restSeconds: undefined,
              },
            ],
            // Match input IDs against ITEM IDs (e.id) or REF IDs (e.exerciseId)?
            // Editor will pass ITEM IDs for precision.
            exercises: draft.exercises.map((ex) =>
              exerciseIds.includes(ex.id)
                ? { ...ex, exerciseGroupId: groupId }
                : ex,
            ),
          },
        });
      },

      removeDraftExerciseGroup: (groupId) => {
        const draft = get().draftTemplate;
        if (!draft) return;

        // Remove group
        const newGroups = draft.exerciseGroups
          .filter((g) => g.id !== groupId)
          .map((g, index) => ({ ...g, groupIndex: index }));

        // Clear groupId from exercises
        const newExercises = draft.exercises.map((ex) =>
          ex.exerciseGroupId === groupId
            ? { ...ex, exerciseGroupId: undefined }
            : ex,
        );

        set({
          draftTemplate: {
            ...draft,
            exerciseGroups: newGroups,
            exercises: newExercises,
          },
        });
      },
    }),
    {
      name: "template-store",
      storage: zustandStorage,
      partialize: (state) => ({ templates: state.templates }), // Don't persist draft
    },
  ),
);
