import { KeyboardAvoidingView, Platform } from 'react-native'

import BaseScreen, { BaseScreenProps } from './BaseScreen'

export interface BaseFormScreenProps extends BaseScreenProps {
  /**
   * Overrides the default keyboard vertical offset.
   * Defaults to 100 on iOS.
   */
  keyboardVerticalOffset?: number
}

const BaseFormScreen = ({
  children,
  keyboardVerticalOffset = 100,
  ...baseScreenProps
}: BaseFormScreenProps) => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
    >
      <BaseScreen {...baseScreenProps} scroll={baseScreenProps.scroll ?? true}>
        {children}
      </BaseScreen>
    </KeyboardAvoidingView>
  )
}

export default BaseFormScreen
