/*
 * Describes the contents of the activation event.
 *
 * onLanguage:typescript will map to:
 *  - id: typescript
 *  - type: language
 */
export interface IActivateExtensionEvent {
  type: 'language' | 'command';
  id: string;
}
