import { FlashList, FlashListProps } from '@shopify/flash-list'
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native'

import { useThemeColor } from '@/hooks/theme'

import BaseScreen, { BaseScreenProps } from './BaseScreen'

export interface BaseListScreenProps<T> extends Omit<
  BaseScreenProps,
  'scroll' | 'refreshControl' | 'children'
> {
  /**
   * The array of data to render in the list.
   */
  data: readonly T[] | null | undefined
  /**
   * Render function for list items.
   */
  renderItem: FlashListProps<T>['renderItem']
  /**
   * Key extractor function.
   */
  keyExtractor?: FlashListProps<T>['keyExtractor']
  /**
   * Estimated item size for FlashList performance.
   * Defaults to 100.
   */
  estimatedItemSize?: number
  /**
   * Refresh callback.
   */
  onRefresh?: () => void | Promise<void>
  /**
   * Is refreshing state.
   */
  isRefreshing?: boolean
  /**
   * Infinite scroll load next page callback.
   */
  onEndReached?: () => void
  /**
   * Is fetching next page state.
   */
  isFetchingNextPage?: boolean
  /**
   * Has next page boolean.
   */
  hasNextPage?: boolean
  /**
   * Text to show when the list is empty.
   */
  emptyText?: string
  /**
   * Text to show when all items are loaded at the bottom.
   */
  endReachedText?: string
  /**
   * Number of columns.
   */
  numColumns?: number
  /**
   * Additional props to pass to FlashList.
   */
  flashListProps?: Partial<FlashListProps<T>>
}

function BaseListScreen<T>({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize = 100,
  onRefresh,
  isRefreshing = false,
  onEndReached,
  isFetchingNextPage = false,
  hasNextPage = false,
  emptyText = 'No items found.',
  endReachedText = "You've reached the end.",
  numColumns,
  flashListProps,
  ...baseScreenProps
}: BaseListScreenProps<T>) {
  const colors = useThemeColor()

  const renderFooter = () => {
    if (!data?.length) return null

    if (hasNextPage) {
      return (
        <View className="mb-[100%] items-center justify-center p-4 pb-12 pt-6">
          {isFetchingNextPage && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      )
    }

    return (
      <View className="mb-[100%] items-center justify-center p-4 pb-12 pt-6">
        <Text className="text-neutral-500 dark:text-neutral-400">{endReachedText}</Text>
      </View>
    )
  }

  const renderEmpty = () => {
    if (baseScreenProps.isLoading) return null
    return (
      <View className="flex-1 items-center justify-center pt-20">
        <Text className="text-lg text-neutral-500 dark:text-neutral-400">{emptyText}</Text>
      </View>
    )
  }

  return (
    <BaseScreen {...baseScreenProps} scroll={false}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        onEndReached={() => {
          if (!isFetchingNextPage && hasNextPage && onEndReached) {
            onEndReached()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter()}
        ListEmptyComponent={renderEmpty()}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        contentContainerStyle={
          baseScreenProps.padded ? { paddingHorizontal: 16, paddingBottom: 16 } : undefined
        }
        {...flashListProps}
      />
    </BaseScreen>
  )
}

export default BaseListScreen
