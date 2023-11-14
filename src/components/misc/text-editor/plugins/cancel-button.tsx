import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

type CancelButtonPluginProps = {
  show?: boolean
  initialState?: SerializedEditorState<SerializedLexicalNode>
  onCancel?: () => void
}

const CancelButtonPlugin = ({
  initialState,
  onCancel,
  show,
}: CancelButtonPluginProps) => {
  const [editor] = useLexicalComposerContext()

  return show ? (
    <button
      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      onClick={() => {
        if (initialState)
          editor.setEditorState(
            editor.parseEditorState(JSON.stringify(initialState)),
          )
        onCancel?.()
      }}
    >
      Cancel
    </button>
  ) : null
}

export default CancelButtonPlugin
