import { ShimmerWrapper } from './SkeletonBlock'
import { SocialWorkoutCardShimmer } from './SocialWorkoutCardShimmer'

export function WorkoutHistoryShimmer() {
  return (
    <ShimmerWrapper className="flex-1">
      <SocialWorkoutCardShimmer />
      <SocialWorkoutCardShimmer />
      <SocialWorkoutCardShimmer />
    </ShimmerWrapper>
  )
}

export default WorkoutHistoryShimmer
