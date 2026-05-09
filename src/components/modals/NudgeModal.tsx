import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { BaseModal, BaseModalHandle } from '@/components/ui/BaseModal'
import { useThemeColor } from '@/hooks/theme'

interface NudgeModalProps {
  targetUserId: string
  targetUserName: string
  hasStreak: boolean
  onSend: (note: string) => void
  isLoading?: boolean
}

export const NudgeModal = forwardRef<BaseModalHandle, NudgeModalProps>(
  ({ targetUserId, targetUserName, hasStreak, onSend, isLoading }, ref) => {
    const colors = useThemeColor()
    const baseModalRef = useRef<BaseModalHandle>(null)
    const [personalMessage, setPersonalMessage] = useState('')

    // expose API
    useImperativeHandle(ref, () => ({
      present: () => baseModalRef.current?.present(),
      dismiss: () => baseModalRef.current?.dismiss(),
    }))

    const title = hasStreak ? `🔥 Nudge ${targetUserName}` : `💪 Send Motivation`
    const subtitle = hasStreak
      ? `${targetUserName} is on a streak. Send some motivation to keep them going.`
      : `${targetUserName} hasn't worked out recently. A quick message could help them restart.`

    return (
      <BaseModal
        ref={baseModalRef}
        title={title}
        description={subtitle}
        floating={true}
        onDismiss={() => {
          setPersonalMessage('')
        }}
        confirmAction={{
          title: 'Send Nudge',
          onPress: () => onSend(personalMessage),
          loading: isLoading,
        }}
        cancelAction={{
          title: 'Cancel',
          onPress: () => baseModalRef.current?.dismiss(),
        }}
      >
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Personal Message (Optional)
            </Text>
            <TextInput
              placeholder="Add a note..."
              placeholderTextColor={colors.neutral[500]}
              value={personalMessage}
              onChangeText={setPersonalMessage}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </View>
      </BaseModal>
    )
  },
)

NudgeModal.displayName = 'NudgeModal'

export default NudgeModal
