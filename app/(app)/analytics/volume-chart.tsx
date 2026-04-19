import { BaseTrainingChart } from '@/components/analytics/BaseTrainingChart'
import { useAuth } from '@/stores/authStore'
import { convertWeight } from '@/utils/converter'
import React from 'react'

export default function VolumeChartScreen() {
	const user = useAuth(s => s.user)
	const preferredUnit = user?.preferredWeightUnit ?? 'kg'

	const formatVolume = (val: number) => {
		const converted = convertWeight(val, { from: 'kg', to: preferredUnit as any, precision: 0 })
		return converted.toLocaleString()
	}

	return (
		<BaseTrainingChart
			title="Training Volume"
			metricKey="volume"
			unit={preferredUnit}
			lineColor="#10b981"
			icon="bar-chart-outline"
			formatValue={formatVolume}
		/>
	)
}
