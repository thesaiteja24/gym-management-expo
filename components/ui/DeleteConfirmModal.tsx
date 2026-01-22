import { useThemeColor } from "@/hooks/useThemeColor";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface DeleteConfirmModalHandle {
  present: () => void;
  dismiss: () => void;
}

type Props = {
  title?: string;
  description?: string;
  onCancel?: () => void;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
};

export const DeleteConfirmModal = forwardRef<DeleteConfirmModalHandle, Props>(
  (
    {
      title = "Delete item?",
      description = "This action cannot be undone.",
      onCancel,
      onConfirm,
      confirmText = "Delete",
    },
    ref,
  ) => {
    const colors = useThemeColor();
    const isDark = useColorScheme() === "dark";
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const lockedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      present: () => {
        lockedRef.current = false;
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      },
    }));

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

    // Dynamic sizing or fixed height? Dynamic is better for varying descriptions.
    // enableDynamicSizing={true} is default in v5 if snapPoints not provided?
    // Let's use enableDynamicSizing explicitly or just omit snapPoints implies it?
    // Actually best to provide no snapPoints and enableDynamicSizing.

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={true}
        onDismiss={onCancel}
        backgroundStyle={{
          backgroundColor: isDark ? "#171717" : "white",
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#525252" : "#d1d5db",
        }}
        // Smoother, slightly slower animation
        animationConfigs={{
          duration: 350,
        }}
      >
        <BottomSheetView
          style={{ paddingBottom: insets.bottom + 24 }}
          className="px-6 pt-2 dark:bg-neutral-900"
        >
          <Text
            className="text-center text-xl font-bold"
            style={{ color: colors.text }}
          >
            {title}
          </Text>

          <Text
            className="mt-3 text-center text-base"
            style={{ color: colors.neutral[500] }}
          >
            {description}
          </Text>

          <View className="mt-8 flex-row gap-3">
            {/* Cancel */}
            <Pressable
              onPress={() => {
                onCancel?.();
                bottomSheetModalRef.current?.dismiss();
              }}
              className="flex-1 rounded-xl border py-4"
              style={{ borderColor: colors.neutral[200] }}
            >
              <Text
                className="text-center text-base font-medium"
                style={{ color: colors.text }}
              >
                Cancel
              </Text>
            </Pressable>
            {/* Delete */}
            <Pressable
              onPress={async () => {
                if (lockedRef.current) return;
                lockedRef.current = true;
                await onConfirm();
                bottomSheetModalRef.current?.dismiss();
              }}
              className="flex-1 rounded-xl py-4"
              style={{ backgroundColor: colors.danger }}
            >
              <Text className="text-center text-base font-bold text-white">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";
