import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { memo, useMemo } from 'react'
import { RefreshControlProps, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemeColor } from '@/hooks/theme'

import { Button } from './buttons'

export interface BaseScreenProps {
  children: React.ReactNode
  footerComponent?: React.ReactNode

  title?: string
  subTitle?: string

  left?: React.ReactNode
  backButton?: boolean
  onBackPress?: () => void

  right?: React.ReactNode

  scroll?: boolean

  padded?: boolean

  refreshControl?: React.ReactElement<RefreshControlProps>
  contentContainerStyle?: StyleProp<ViewStyle>

  isLoading?: boolean
  shimmer?: React.ReactNode
}

export const Header = memo(
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
            className="text-xl font-semibold tracking-widest text-black dark:text-white"
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
              <Text className="text-2xl font-semibold tracking-widest text-black dark:text-white">
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
  footerComponent,
  title,
  subTitle,
  left,
  backButton,
  onBackPress,
  right,
  scroll = false,
  padded = true,
  refreshControl,
  contentContainerStyle,
  isLoading = false,
  shimmer,
}: BaseScreenProps) => {
  const router = useRouter()
  const theme = useThemeColor()

  const handleBackPress = React.useCallback(() => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }, [onBackPress, router])

  const renderedLeft = useMemo(() => {
    if (left) return left
    if (backButton) {
      return (
        <Button
          title=""
          variant="ghost"
          leftIcon={
            <MaterialCommunityIcons
              name="chevron-double-left"
              size={32}
              color={theme.isDark ? 'white' : 'black'}
            />
          }
          onPress={handleBackPress}
          className="p-0"
        />
      )
    }
    return null
  }, [left, backButton, theme.isDark, handleBackPress])

  return (
    <SafeAreaView
      className={`flex-1 bg-white dark:bg-black ${padded && !scroll ? 'px-4 pt-4' : ''}`}
    >
      {title || subTitle || left || right ? (
        <View className={padded && scroll ? 'px-4 pt-4' : ''}>
          <Header title={title} subTitle={subTitle} left={renderedLeft} right={right} />
        </View>
      ) : null}

      {isLoading && shimmer ? (
        <View className={padded && scroll ? 'flex-1 px-4' : 'flex-1'}>{shimmer}</View>
      ) : scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            padded
              ? {
                  paddingHorizontal: 16,
                  paddingTop: title || subTitle || left || right ? 0 : 16,
                  paddingBottom: 16,
                }
              : undefined,
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
      {!isLoading && footerComponent && footerComponent}
    </SafeAreaView>
  )
}

export default BaseScreen
