import CustomHeader from '@/components/navigation/CustomHeader'
import { Stack } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native'

export default function WorkoutLayout() {
	return (
		<Stack
			screenOptions={{
				contentStyle: {
					backgroundColor: useColorScheme() === 'dark' ? '#000000' : '#ffffff',
				},
				header: props => {
					const { options } = props

					const custom = options as any

					return (
						<CustomHeader
							title={options.title ?? ''}
							leftIcon={custom.leftIcon}
							onLeftPress={custom.onLeftPress}
							rightIcons={custom.rightIcons}
						/>
					)
				},
			}}
		>
			<Stack.Screen
				name="index"
				options={
					{
						title: 'Workout',
					} as any
				}
			/>
		</Stack>
	)
}
