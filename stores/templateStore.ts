import { checkNetworkStatus } from "@/hooks/useNetworkStatus";
import { enqueue } from "@/lib/offlineQueue";
import { zustandStorage } from "@/lib/storage";
import {
  createTemplateService,
  deleteTemplateService,
  getAllTemplatesService,
  updateTemplateService,
} from "@/services/templateService";
import { serializeTemplateForApi } from "@/utils/template";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuth } from "./authStore";
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

        const payload = serializeTemplateForApi(data);
        const userId = useAuth.getState().user?.userId;

        try {
          // Network check
          const { isConnected, isInternetReachable } =
            await checkNetworkStatus();
          const isOnline = isConnected && isInternetReachable !== false;

          if (!isOnline && userId) {
            enqueue("CREATE_TEMPLATE", payload, userId);
            // Optimistic Update: Add to local templates
            const newTemplate = {
              ...payload,
              id: Crypto.randomUUID(), // Temp ID, might need reconciliation later if backend returns diff ID
            };
            set({ templateLoading: false });
            return { success: true, queued: true };
          }

          const res = await createTemplateService(payload);
          if (res.success) {
            // Optimistic or Refetch
            get().getAllTemplates();
            return { success: true };
          }
          return res;
        } catch (e) {
          if (userId) {
            enqueue("CREATE_TEMPLATE", payload, userId);
            set({ templateLoading: false });
            return { success: true, queued: true };
          }
          return { success: false, error: e };
        } finally {
          set({ templateLoading: false });
        }
      },

      updateTemplate: async (id, data) => {
        set({ templateLoading: true });

        const payload =
          "exercises" in data ? serializeTemplateForApi(data as any) : data;
        const userId = useAuth.getState().user?.userId;

        try {
          const { isConnected, isInternetReachable } =
            await checkNetworkStatus();
          const isOnline = isConnected && isInternetReachable !== false;

          if (!isOnline && userId) {
            enqueue("EDIT_TEMPLATE", { id, ...payload }, userId);
            // Optimistic local update
            set((state) => ({
              templates: state.templates.map((t) =>
                t.id === id ? ({ ...t, ...payload } as any) : t,
              ),
            }));
            set({ templateLoading: false });
            return { success: true, queued: true };
          }

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
          if (userId) {
            enqueue("EDIT_TEMPLATE", { id, ...payload }, userId);
            set((state) => ({
              templates: state.templates.map((t) =>
                t.id === id ? ({ ...t, ...payload } as any) : t,
              ),
            }));
            set({ templateLoading: false });
            return { success: true, queued: true };
          }
          return { success: false, error: e };
        } finally {
          set({ templateLoading: false });
        }
      },

      deleteTemplate: async (id) => {
        set({ templateLoading: true });

        const userId = useAuth.getState().user?.userId;

        try {
          const { isConnected, isInternetReachable } =
            await checkNetworkStatus();
          const isOnline = isConnected && isInternetReachable !== false;

          // Optimistic update (always good for delete)
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          }));

          if (!isOnline && userId) {
            enqueue("DELETE_TEMPLATE", { id }, userId);
            set({ templateLoading: false });
            return;
          }

          await deleteTemplateService(id);
        } catch (e) {
          console.error("Failed to delete template", e);
          if (userId) {
            enqueue("DELETE_TEMPLATE", { id }, userId);
          }
        } finally {
          set({ templateLoading: false });
        }
      },

      startWorkoutFromTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) {
          console.error(`[Template] Template not found: ${templateId}`);
          // Note: Toast import would be needed here for user notification
          // For now, just log the error for debugging
          return;
        }

        const { loadTemplate } = useWorkout.getState();
        loadTemplate(template);
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

      // Update template title and template note
      updateDraftTemplate: (patch) => {
        const draft = get().draftTemplate;
        if (!draft) return;
        set({ draftTemplate: { ...draft, ...patch } });
      },

      discardDraftTemplate: () => {
        set({ draftTemplate: null });
      },

      // add exercise to draft template
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

      // remove exercise from draft template used in exercise editor and exercise screen
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

      // replace exercise in draft template used in exercise editor and exercise screen
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

      // reorder exercises in draft template used in exercise editor and exercise screen
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

      // add set to draft template used in exercise editor and exercise screen
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
              note: undefined,
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

      // update set in draft template used in exercise editor and exercise screen
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

      // remove set from draft template used in exercise editor and exercise screen
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

      // create exercise group in draft template used in exercise editor and exercise screen
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
