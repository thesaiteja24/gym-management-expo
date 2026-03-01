import { Button } from '@/components/ui/Button'
import DateTimePicker from '@/components/ui/DateTimePicker'
import { SelectableCard } from '@/components/ui/SelectableCard'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth, User } from '@/stores/authStore'
import { useUser } from '@/stores/userStore'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import { BackHandler, Keyboard, Platform, Text, TextInput, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export const FitnessGoalsSheet = forwardRef<BottomSheetModal>((props, ref) => {
	const colors = useThemeColor()
	const isDarkMode = useColorScheme() === 'dark'
	const insets = useSafeAreaInsets()

	const user = useAuth(s => s.user) as User | null
	const updateUserFitnessProfile = useUser(s => s.updateUserFitnessProfile)
	const isLoading = useUser(s => s.isLoading)
	const [isOpen, setIsOpen] = useState(false)

	const lineHeight = Platform.OS === 'ios' ? 0 : 30

	const [fitnessGoal, setFitnessGoal] = useState<string | null>(null)
	const [targetWeight, setTargetWeight] = useState('')
	const [targetDate, setTargetDate] = useState<Date | null>(null)

	useEffect(() => {
		if (user?.fitnessProfile) {
			setFitnessGoal(user.fitnessProfile.fitnessGoal)
			setTargetWeight(user.fitnessProfile.targetWeight ? String(user.fitnessProfile.targetWeight) : '')
			setTargetDate(user.fitnessProfile.targetDate ? new Date(user.fitnessProfile.targetDate) : null)
		}
	}, [user?.fitnessProfile])

	const handleSave = useCallback(async () => {
		if (!user?.userId) return
		Keyboard.dismiss()

		const payload: Record<string, any> = {}

		if (fitnessGoal) payload.fitnessGoal = fitnessGoal
		if (targetWeight) payload.targetWeight = parseFloat(targetWeight)
		if (targetDate) payload.targetDate = targetDate.toISOString()

		const res = await updateUserFitnessProfile(user.userId, payload)

		if (res?.success) {
			Toast.show({ type: 'success', text1: 'Goals updated successfully!' })
			// @ts-ignore
			ref?.current?.dismiss()
		} else {
			Toast.show({ type: 'error', text1: 'Failed to update goals' })
		}
	}, [fitnessGoal, targetWeight, targetDate, user?.userId, updateUserFitnessProfile, ref])

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			if (isOpen) {
				// @ts-ignore
				ref?.current?.dismiss()
				return true // prevent navigation
			}
			return false // allow normal back navigation
		})

		return () => backHandler.remove()
	}, [isOpen, ref])

	return (
		<BottomSheetModal
			ref={ref}
			index={0}
			snapPoints={['80%']}
			enableDynamicSizing={false}
			backdropComponent={props => (
				<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
			)}
			backgroundStyle={{
				backgroundColor: isDarkMode ? '#171717' : 'white',
			}}
			handleIndicatorStyle={{
				backgroundColor: isDarkMode ? '#525252' : '#d1d5db',
			}}
			animationConfigs={{
				duration: 350,
			}}
			onChange={index => {
				setIsOpen(index >= 0)
			}}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
		>
			<BottomSheetScrollView
				contentContainerStyle={{
					paddingBottom: insets.bottom + 16,
					paddingHorizontal: 24,
					paddingTop: 8,
				}}
			>
				<Text className="mb-2 text-center text-xl font-bold text-black dark:text-white">Fitness Goals</Text>
				<Text className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
					Set your target goals to stay motivated.
				</Text>

				<View className="flex flex-col gap-6">
					{/* Primary Goal Selection */}
					<View className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
						<Text className="mb-3 text-lg font-semibold text-black dark:text-white">Primary Goal</Text>
						<View className="flex-row flex-wrap gap-2">
							<GoalCard
								selected={fitnessGoal === 'loseWeight'}
								onSelect={() => setFitnessGoal('loseWeight')}
								title="Lose Weight"
							/>
							<GoalCard
								selected={fitnessGoal === 'gainMuscle'}
								onSelect={() => setFitnessGoal('gainMuscle')}
								title="Gain Muscle"
							/>
							<GoalCard
								selected={fitnessGoal === 'improveEndurance'}
								onSelect={() => setFitnessGoal('improveEndurance')}
								title="Endurance"
							/>
							<GoalCard
								selected={fitnessGoal === 'improveStrength'}
								onSelect={() => setFitnessGoal('improveStrength')}
								title="Reach PR"
							/>
						</View>
					</View>

					{/* Target Weight */}
					<View className="flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
						<Text className="text-lg font-semibold text-black dark:text-white">
							Target Weight ({user?.preferredWeightUnit || 'kg'})
						</Text>
						<TextInput
							value={targetWeight}
							placeholder="--"
							placeholderTextColor={colors.neutral[500]}
							keyboardType="decimal-pad"
							onChangeText={setTargetWeight}
							editable={!isLoading}
							className="min-w-[60px] text-right text-lg text-primary"
							style={{ lineHeight }}
						/>
					</View>

					<View className="flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
						<Text className="text-lg font-semibold text-black dark:text-white">Target Date</Text>
						<DateTimePicker value={targetDate ?? undefined} dateOnly onUpdate={setTargetDate} />
					</View>
				</View>

				<Button
					title="Save Goals"
					variant="primary"
					loading={isLoading}
					className="mt-6"
					onPress={handleSave}
				/>
			</BottomSheetScrollView>
		</BottomSheetModal>
	)
})

function GoalCard({ selected, onSelect, title }: any) {
	return <SelectableCard selected={selected} onSelect={onSelect} title={title} className="basis-[48%] px-3 py-3" />
}

export default FitnessGoalsSheet
