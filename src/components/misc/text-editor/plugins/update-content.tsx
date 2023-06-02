'use client'

import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

const UpdateContentPlugin = ({
  content,
}: {
  content: SerializedEditorState<SerializedLexicalNode> | undefined
}) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (content) editor.setEditorState(editor.parseEditorState(content))
  }, [content, editor])

  return null
}

export default UpdateContentPlugin
