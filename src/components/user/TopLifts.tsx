import { Text, View } from 'react-native'

interface LiftCardProps {
  label: string
  weight: string
}

function LiftCard({ label, weight }: LiftCardProps) {
  return (
    <View className="flex-1 items-center rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{weight}</Text>
    </View>
  )
}

export function TopLifts() {
  return (
    <View className="gap-2">
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Top Lifts
      </Text>
      <View className="flex-row gap-3">
        <LiftCard label="Squat" weight="140kg" />
        <LiftCard label="Bench" weight="100kg" />
        <LiftCard label="Deadlift" weight="180kg" />
      </View>
    </View>
  )
}

export default TopLifts
