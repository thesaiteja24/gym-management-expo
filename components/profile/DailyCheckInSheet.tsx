import { Button } from '@/components/ui/Button'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth, User } from '@/stores/authStore'
import { useUser } from '@/stores/userStore'
import { prepareImageForUpload } from '@/utils/prepareImageForUpload'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import * as ImagePicker from 'expo-image-picker'
import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import {
	BackHandler,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export const DailyCheckInSheet = forwardRef<BottomSheetModal>((props, ref) => {
	const colors = useThemeColor()
	const isDarkMode = useColorScheme() === 'dark'
	const insets = useSafeAreaInsets()
	const [isOpen, setIsOpen] = useState(false)

	const user = useAuth(s => s.user) as User | null
	const addDailyMeasurement = useUser(s => s.addDailyMeasurement)
	const isLoading = useUser(s => s.isLoading)

	const lineHeight = Platform.OS === 'ios' ? 0 : 30

	// State for all backend fields
	const [weight, setWeight] = useState('')
	const [bodyFat, setBodyFat] = useState('')
	const [leanBodyMass, setLeanBodyMass] = useState('')
	const [neck, setNeck] = useState('')
	const [shoulders, setShoulders] = useState('')
	const [chest, setChest] = useState('')
	const [waist, setWaist] = useState('')
	const [abdomen, setAbdomen] = useState('')
	const [hips, setHips] = useState('')
	const [leftBicep, setLeftBicep] = useState('')
	const [rightBicep, setRightBicep] = useState('')
	const [leftForearm, setLeftForearm] = useState('')
	const [rightForearm, setRightForearm] = useState('')
	const [leftThigh, setLeftThigh] = useState('')
	const [rightThigh, setRightThigh] = useState('')
	const [leftCalf, setLeftCalf] = useState('')
	const [rightCalf, setRightCalf] = useState('')
	const [notes, setNotes] = useState('')
	const [progressPics, setProgressPics] = useState<{ uri: string; name: string; type: string }[]>([])

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			if (isOpen) {
				// @ts-ignore
				ref?.current?.dismiss()
				return true
			}
			return false
		})
		return () => backHandler.remove()
	}, [isOpen, ref])

	const pickImages = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: true,
			quality: 0.8,
		})

		if (!result.canceled) {
			try {
				// Prepare images for upload sequentially
				const processedPics = await Promise.all(
					result.assets.map(async asset => {
						const prepared = await prepareImageForUpload(
							{
								uri: asset.uri,
								fileName: asset.fileName || `progress_${Date.now()}.jpg`,
								type: asset.mimeType || 'image/jpeg',
							},
							'post'
						)
						return prepared as { uri: string; name: string; type: string }
					})
				)
				setProgressPics(prev => [...prev, ...processedPics])
			} catch (error) {
				Toast.show({ type: 'error', text1: 'Failed to process some images' })
			}
		}
	}

	const handleRemovePic = (index: number) => {
		setProgressPics(prev => prev.filter((_, i) => i !== index))
	}

	const handleSave = useCallback(async () => {
		if (!user?.userId) return
		Keyboard.dismiss()

		const formData = new FormData()
		formData.append('date', new Date().toISOString())

		const appendNum = (key: string, val: string) => {
			if (val) formData.append(key, parseFloat(val).toString())
		}

		appendNum('weight', weight)
		appendNum('bodyFat', bodyFat)
		appendNum('leanBodyMass', leanBodyMass)
		appendNum('neck', neck)
		appendNum('shoulders', shoulders)
		appendNum('chest', chest)
		appendNum('waist', waist)
		appendNum('abdomen', abdomen)
		appendNum('hips', hips)
		appendNum('leftBicep', leftBicep)
		appendNum('rightBicep', rightBicep)
		appendNum('leftForearm', leftForearm)
		appendNum('rightForearm', rightForearm)
		appendNum('leftThigh', leftThigh)
		appendNum('rightThigh', rightThigh)
		appendNum('leftCalf', leftCalf)
		appendNum('rightCalf', rightCalf)

		if (notes) formData.append('notes', notes)

		progressPics.forEach(pic => {
			formData.append('progressPics', pic as any)
		})

		const res = await addDailyMeasurement(user.userId, formData)

		if (res?.success) {
			Toast.show({ type: 'success', text1: 'Check-in saved successfully!' })
			// @ts-ignore
			ref?.current?.dismiss()

			// Optional: reset fields after successful save
			setNotes('')
			setProgressPics([])
		} else {
			Toast.show({ type: 'error', text1: 'Failed to save check-in' })
		}
	}, [
		weight,
		bodyFat,
		leanBodyMass,
		neck,
		shoulders,
		chest,
		waist,
		abdomen,
		hips,
		leftBicep,
		rightBicep,
		leftForearm,
		rightForearm,
		leftThigh,
		rightThigh,
		leftCalf,
		rightCalf,
		notes,
		progressPics,
		user?.userId,
		addDailyMeasurement,
		ref,
	])

	const lengthUnit = user?.preferredLengthUnit || 'cm'
	const SectionHeader = ({ title }: { title: string }) => (
		<Text className="mb-2 mt-4 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
			{title}
		</Text>
	)

	return (
		<BottomSheetModal
			ref={ref}
			index={0}
			snapPoints={['90%']}
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
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			style={{ marginTop: insets.top }}
			stackBehavior="push"
			onChange={index => setIsOpen(index >= 0)}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
				keyboardVerticalOffset={100}
			>
				<BottomSheetScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 8,
						paddingBottom: insets.bottom + 100,
					}}
					nestedScrollEnabled
					showsVerticalScrollIndicator={false}
				>
					<Text className="mb-2 text-center text-xl font-bold text-black dark:text-white">
						Daily Check-In
					</Text>
					<Text className="mb-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
						Log body measurements and progress photos.
					</Text>

					<View className="flex flex-col gap-2">
						{/* --- Pictures --- */}
						<SectionHeader title="Progress Pictures" />
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							nestedScrollEnabled
							className="mb-4 py-4"
						>
							<TouchableOpacity
								onPress={pickImages}
								className="mr-3 h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
							>
								<MaterialCommunityIcons
									name="camera-plus"
									size={28}
									color={isDarkMode ? '#A3A3A3' : '#737373'}
								/>
								<Text className="mt-1 text-xs text-neutral-500">Add Photo</Text>
							</TouchableOpacity>

							{progressPics.map((pic, index) => (
								<View key={index} className="relative mr-3 h-24 w-24 rounded-xl">
									<Image source={{ uri: pic.uri }} className="h-full w-full rounded-xl" />
									<TouchableOpacity
										onPress={() => handleRemovePic(index)}
										className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1"
									>
										<MaterialCommunityIcons name="close" size={14} color="white" />
									</TouchableOpacity>
								</View>
							))}
						</ScrollView>

						{/* --- Notes --- */}
						<SectionHeader title="Notes" />
						<BottomSheetTextInput
							value={notes}
							onChangeText={setNotes}
							placeholder="Any reflections on today's progress?"
							placeholderTextColor={colors.neutral[500]}
							multiline
							numberOfLines={3}
							className="min-h-[80px] rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-base text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
							style={{ textAlignVertical: 'top' }}
						/>

						{/* --- General --- */}
						<SectionHeader title="General" />
						<MeasurementInput
							label={`Weight (${user?.preferredWeightUnit || 'kg'})`}
							value={weight}
							onChangeText={setWeight}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Body Fat %"
							value={bodyFat}
							onChangeText={setBodyFat}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label={`Lean Body Mass (${user?.preferredWeightUnit || 'kg'})`}
							value={leanBodyMass}
							onChangeText={setLeanBodyMass}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>

						{/* --- Torso --- */}
						<SectionHeader title={`Torso (${lengthUnit})`} />
						<MeasurementInput
							label="Shoulders"
							value={shoulders}
							onChangeText={setShoulders}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Chest"
							value={chest}
							onChangeText={setChest}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Waist"
							value={waist}
							onChangeText={setWaist}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Abdomen"
							value={abdomen}
							onChangeText={setAbdomen}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Hips"
							value={hips}
							onChangeText={setHips}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Neck"
							value={neck}
							onChangeText={setNeck}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>

						{/* --- Arms --- */}
						<SectionHeader title={`Arms (${lengthUnit})`} />
						<MeasurementInput
							label="Left Bicep"
							value={leftBicep}
							onChangeText={setLeftBicep}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Right Bicep"
							value={rightBicep}
							onChangeText={setRightBicep}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Left Forearm"
							value={leftForearm}
							onChangeText={setLeftForearm}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Right Forearm"
							value={rightForearm}
							onChangeText={setRightForearm}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>

						{/* --- Legs --- */}
						<SectionHeader title={`Legs (${lengthUnit})`} />
						<MeasurementInput
							label="Left Thigh"
							value={leftThigh}
							onChangeText={setLeftThigh}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Right Thigh"
							value={rightThigh}
							onChangeText={setRightThigh}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Left Calf"
							value={leftCalf}
							onChangeText={setLeftCalf}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
						<MeasurementInput
							label="Right Calf"
							value={rightCalf}
							onChangeText={setRightCalf}
							editable={!isLoading}
							colors={colors}
							lineHeight={lineHeight}
						/>
					</View>
					<Button
						title="Save Check-In"
						variant="primary"
						loading={isLoading}
						className="mt-8"
						onPress={handleSave}
					/>
				</BottomSheetScrollView>
			</KeyboardAvoidingView>
		</BottomSheetModal>
	)
})

function MeasurementInput({ label, value, onChangeText, editable, colors, lineHeight }: any) {
	return (
		<View className="flex flex-row items-center justify-between border-b border-neutral-100 py-3 dark:border-neutral-800">
			<Text className="text-base font-medium text-black dark:text-white">{label}</Text>
			<BottomSheetTextInput
				value={value}
				placeholder="--"
				placeholderTextColor={colors.neutral[500]}
				keyboardType="decimal-pad"
				onChangeText={onChangeText}
				editable={editable}
				className="min-w-[60px] text-right text-lg text-primary"
				style={{ color: colors.primary, lineHeight }}
			/>
		</View>
	)
}

export default DailyCheckInSheet
