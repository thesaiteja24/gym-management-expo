import { Image } from 'expo-image'
import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useThemeColor } from '@/hooks/theme'
import { Exercise } from '@/types/exercises'

interface ExerciseListItemProps {
  item: Exercise
  isSelecting?: boolean
  selected: boolean
  onPress: (exercise: Exercise) => void
  onLongPress?: (exercise: Exercise) => void
}

export const ExerciseListItem = memo(
  ({ item, isSelecting, selected, onPress, onLongPress }: ExerciseListItemProps) => {
    const colors = useThemeColor()

    return (
      <TouchableOpacity
        activeOpacity={1}
        className={`mb-2 h-20 flex-row items-center justify-between ${
          selected && isSelecting ? 'rounded-l-lg border-l-4 border-l-amber-500 pl-4' : ''
        }`}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress?.(item)}
        delayLongPress={700}
      >
        <View className="w-3/4">
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            {item.title}
          </Text>

          <View className="mt-1 flex-row gap-4">
            {item.equipment && <Text className="text-sm text-primary">{item.equipment.title}</Text>}

            {item.primaryMuscleGroup && (
              <Text className="text-sm text-primary">{item.primaryMuscleGroup.title}</Text>
            )}

            <Text className="text-sm text-red-600">PR</Text>
          </View>
        </View>

        <Image
          source={item.thumbnailUrl}
          style={{
            width: 48,
            height: 48,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.isDark ? colors.neutral[800] : colors.white,
          }}
          contentFit="cover"
        />
      </TouchableOpacity>
    )
  },
)

ExerciseListItem.displayName = 'ExerciseListItem'
