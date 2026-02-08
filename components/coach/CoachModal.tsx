import { useCoach } from "@/hooks/useCoach";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { Button } from "../ui/Button";

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
  const {
    coachState,
    recorderState,
    isPlaying,
    recordedAudioUri,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  } = useCoach();

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
          height: "90%",
          flex: 1,
          paddingBottom: insets.bottom,
        }}
        className="dark:bg-neutral-900"
      >
        {/* Groundwork only */}
        <View className="flex-1 flex-col items-center justify-center">
          <View className="flex flex-col gap-4">
            {recorderState.isRecording ? (
              <Button
                title="Stop Recording"
                variant="danger"
                onPress={() => {
                  stopRecording();
                }}
              />
            ) : (
              <Button
                title="Start Recording"
                variant="success"
                onPress={() => {
                  startRecording();
                }}
              />
            )}
            <View className="flex-row items-center gap-4">
              <Button
                title={isPlaying ? "Stop Playing" : "Play Recording"}
                variant="primary"
                disabled={!recordedAudioUri}
                onPress={() => {
                  playRecording();
                }}
              />

              <Button
                title=""
                rightIcon={
                  <MaterialCommunityIcons
                    name="delete"
                    size={24}
                    color="white"
                  />
                }
                variant="danger"
                disabled={!recordedAudioUri}
                onPress={() => {
                  clearRecording();
                }}
              />
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CoachModal.displayName = "CoachModal";

export default CoachModal;
