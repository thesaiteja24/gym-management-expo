import { useThemeColor } from "@/hooks/useThemeColor";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface CoachModalHandle {
  present: () => void;
  dismiss: () => void;
}

type Props = {
  onClose?: () => void;
};

const CoachModal = forwardRef<CoachModalHandle, Props>(({ onClose }, ref) => {
  const colors = useThemeColor();
  const isDark = useColorScheme() === "dark";
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => {
      setIsOpen(true);
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  // ✅ Handle Android back gesture
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isOpen) {
          bottomSheetModalRef.current?.dismiss();
          return true; // consume back press
        }
        return false; // allow navigation
      },
    );

    return () => subscription.remove();
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ["90%"], []);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        setIsOpen(false);
        onClose?.();
      }}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: isDark ? "#171717" : "white",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#525252" : "#d1d5db",
      }}
      animationConfigs={{
        duration: 350,
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingBottom: insets.bottom,
        }}
        className="dark:bg-neutral-900"
      >
        {/* Groundwork only */}
        <View className="flex-1" />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CoachModal.displayName = "CoachModal";

export default CoachModal;
