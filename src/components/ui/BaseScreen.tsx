import React, { memo } from 'react'
import { RefreshControlProps, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface BaseScreenProps {
  children: React.ReactNode

  title?: string
  subTitle?: string

  left?: React.ReactNode
  right?: React.ReactNode

  scroll?: boolean

  padded?: boolean

  refreshControl?: React.ReactElement<RefreshControlProps>
  contentContainerStyle?: StyleProp<ViewStyle>

  isLoading?: boolean
  shimmer?: React.ReactNode
}

const Header = memo(
  ({
    title,
    subTitle,
    left,
    right,
  }: Pick<BaseScreenProps, 'title' | 'subTitle' | 'left' | 'right'>) => {
    const hasCenteredHeader = Boolean(left && title)

    if (hasCenteredHeader) {
      return (
        <View className="relative flex-row items-center justify-between pb-4">
          <View className="flex-1 items-start">{left}</View>

          <Text
            numberOfLines={1}
            className="text-2xl font-semibold tracking-wide text-black dark:text-white"
          >
            {title}
          </Text>

          <View className="flex-1 items-end">{right}</View>
        </View>
      )
    }

    return (
      <View className="flex-row items-start justify-between pb-4">
        <View className="flex-1 items-start">
          {title ? (
            <View>
              <Text className="text-2xl font-semibold tracking-wide text-black dark:text-white">
                {title}
              </Text>

              {subTitle && (
                <Text className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
                  {subTitle}
                </Text>
              )}
            </View>
          ) : (
            left
          )}
        </View>

        {right && <View className="items-end">{right}</View>}
      </View>
    )
  },
)

Header.displayName = 'Header'

const BaseScreen = ({
  children,
  title,
  subTitle,
  left,
  right,
  scroll = false,
  padded = true,
  refreshControl,
  contentContainerStyle,
  isLoading = false,
  shimmer,
}: BaseScreenProps) => {
  return (
    <SafeAreaView className={`flex-1 bg-white dark:bg-black ${padded ? 'px-4 pt-4' : ''}`}>
      <Header title={title} subTitle={subTitle} left={left} right={right} />

      {isLoading && shimmer ? (
        shimmer
      ) : scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={[contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  )
}

export default BaseScreen
