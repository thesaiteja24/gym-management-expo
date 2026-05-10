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
}

const Header = memo(
  ({
    title,
    subTitle,
    left,
    right,
  }: Pick<BaseScreenProps, 'title' | 'subTitle' | 'left' | 'right'>) => {
    return (
      <View className="flex-row items-center justify-between pb-4">
        <View className="items-start">{left}</View>

        <View className="flex-1">
          {title && (
            <Text className="text-2xl font-bold tracking-wide text-black dark:text-white">
              {title}
            </Text>
          )}
          {subTitle && (
            <Text className="text-base font-normal text-neutral-600 dark:text-neutral-400">
              {subTitle}
            </Text>
          )}
        </View>

        <View className="items-end">{right}</View>
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
}: BaseScreenProps) => {
  return (
    <SafeAreaView className={`flex-1 bg-white dark:bg-black ${padded ? 'px-4 pt-4' : ''}`}>
      <Header title={title} subTitle={subTitle} left={left} right={right} />

      {scroll ? (
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
