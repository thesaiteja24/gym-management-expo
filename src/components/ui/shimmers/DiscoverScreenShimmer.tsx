import { FadeInDown } from 'react-native-reanimated'

import { ShimmerWrapper } from './SkeletonBlock'
import { SocialWorkoutCardShimmer } from './SocialWorkoutCardShimmer'

export function DiscoverScreenShimmer() {
  return (
    <ShimmerWrapper entering={FadeInDown.duration(300).springify()} className="flex-1">
      <SocialWorkoutCardShimmer />
      <SocialWorkoutCardShimmer />
      <SocialWorkoutCardShimmer />
    </ShimmerWrapper>
  )
}

export default DiscoverScreenShimmer
