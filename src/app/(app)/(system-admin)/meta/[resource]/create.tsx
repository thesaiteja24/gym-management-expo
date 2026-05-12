import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { Keyboard, Platform, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'

import { Button } from '@/components/ui'
import BaseScreen from '@/components/ui/BaseScreen'
import { UserEditableAvatar } from '@/components/user/UserEditableAvatar'
import { useCreateMeta } from '@/hooks/queries/meta'
import { Arise } from '@/lib/arise'
import { EquipmentType, MetaResource } from '@/types/meta'
import { prepareImageForUpload } from '@/utils/prepareImageForUpload'

export default function CreateMeta() {
  const { resource } = useLocalSearchParams<{ resource: MetaResource }>()
  const isDarkMode = useColorScheme() === 'dark'

  const isEquipment = resource === 'equipment'
  const label = isEquipment ? 'Equipment' : 'Muscle Group'

  const createMutation = useCreateMeta(resource)

  const [title, setTitle] = useState('')
  const [equipmentType, setEquipmentType] = useState<EquipmentType | null>(
    isEquipment ? 'other' : null,
  )
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const lineHeight = Platform.OS === 'ios' ? 0 : 30

  const onSave = useCallback(async () => {
    if (!title.trim() || createMutation.isPending) {
      Arise.error({ heading: 'Title is required' })
      return
    }

    Keyboard.dismiss()

    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      if (isEquipment && equipmentType) {
        formData.append('type', equipmentType)
      }

      if (thumbnailUri) {
        setUploading(true)

        const prepared = await prepareImageForUpload(
          { uri: thumbnailUri, fileName: `${resource}.jpg`, type: 'image/jpeg' },
          'equipment',
        )

        formData.append('image', prepared as any)
      }

      createMutation.mutate(formData, {
        onSuccess: () => {
          Arise.success({ heading: `${label} created successfully` })
          router.back()
        },
        onError: (e: any) => {
          Arise.error({
            heading: `Failed to create ${label.toLowerCase()}`,
          })
          console.error(e)
        },
        onSettled: () => {
          setUploading(false)
        },
      })
    } catch (e: any) {
      Arise.error({ heading: e.message || `Failed to create ${label.toLowerCase()}` })
      setUploading(false)
    }
  }, [title, equipmentType, thumbnailUri, createMutation, isEquipment, label, resource])

  const renderHeaderRight = () => (
    <Button
      variant="ghost"
      title=""
      onPress={onSave}
      disabled={createMutation.isPending || !title.trim()}
      leftIcon={<Ionicons name="checkmark-done" size={28} color="green" />}
      className="p-0"
    />
  )

  return (
    <BaseScreen title={`Add ${label}`} backButton right={renderHeaderRight()}>
      <View className="mb-6 items-center">
        <UserEditableAvatar
          uri={thumbnailUri}
          size={132}
          editable={!createMutation.isPending}
          uploading={uploading}
          onChange={(uri) => uri && setThumbnailUri(uri)}
          shape="circle"
        />
      </View>

      <View className="mb-6 flex flex-row items-center gap-8">
        <Text className="w-16 text-lg font-semibold text-black dark:text-white">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={!createMutation.isPending}
          placeholder={`e.g. ${isEquipment ? 'Barbell' : 'Chest'}`}
          className="flex-1 text-lg text-blue-500"
          placeholderTextColor={isDarkMode ? '#a3a3a3' : '#737373'}
          style={{ lineHeight }}
        />
      </View>

      {isEquipment && (
        <View className="flex flex-row items-center gap-8">
          <Text className="w-16 text-lg font-semibold text-black dark:text-white">Type</Text>
          <View className="flex-1 flex-row flex-wrap gap-2">
            {(
              [
                'bodyweight',
                'dumbbells',
                'barbells',
                'kettlebells',
                'resistanceBands',
                'machines',
                'other',
              ] as EquipmentType[]
            ).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setEquipmentType(t)}
                disabled={createMutation.isPending}
                className={`rounded-full px-4 py-2 ${
                  equipmentType === t ? 'bg-blue-500' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    equipmentType === t ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </BaseScreen>
  )
}
