import { Button } from '@/components/ui/buttons/Button'
import { useThemeColor } from '@/hooks/theme'
import { type UpdateState } from '@/types/app-updates'
import { useRef } from 'react'
import { Modal, Platform, Text, View } from 'react-native'

type Props = {
  visible: boolean
  state: UpdateState
  onLater: () => void
  onRestart: () => Promise<void>
}

export function OtaUpdateModal({ visible, state, onLater, onRestart }: Props) {
  const isBusy = state !== 'idle'
  const colors = useThemeColor()

  // 🔒 Immediate synchronous lock (no re-render needed)
  const restartLockedRef = useRef(false)

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          className="w-full overflow-hidden rounded-[28px] border shadow-xl"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          pointerEvents={isBusy ? 'none' : 'auto'}
        >
          <View className="p-6">
            <Text className="text-center text-xl font-bold" style={{ color: colors.text }}>
              Update available
            </Text>

            <Text className="mt-3 text-center" style={{ color: colors.neutral[500] }}>
              {state === 'idle' && 'A new version of Pump is ready. Restart to apply it.'}
              {state === 'downloading' && 'Downloading update…'}
              {state === 'restarting' && 'Restarting app…'}
            </Text>

            {/* Progress bar */}
            {state !== 'idle' && (
              <View
                className="mt-5 h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: colors.neutral[200] }}
              >
                <View
                  className={`h-full ${state === 'downloading' ? 'w-2/3' : 'w-full'}`}
                  style={{ backgroundColor: colors.text }}
                />
              </View>
            )}

            <View className="mt-6 flex-row gap-3">
              <View className="flex-1">
                <Button
                  title="Later"
                  variant="secondary"
                  onPress={onLater}
                  disabled={isBusy}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Restart"
                  variant="primary"
                  onPress={async () => {
                    if (restartLockedRef.current) return
                    restartLockedRef.current = true
                    try {
                      await onRestart()
                    } catch {
                      restartLockedRef.current = false
                    }
                  }}
                  disabled={isBusy}
                  loading={state === 'restarting'}
                />
            </View>
          </View>
        </View>
        </View>
      </View>
    </Modal>
  )
}
