'use client'

import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import classNames from 'classnames'
import type {
  EditorState,
  EditorThemeClasses,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical'
import { useMemo, useState } from 'react'

type EditorProps = {
  namespace: string
  placeholder?: Parameters<typeof RichTextPlugin>['0']['placeholder']
  preset?: SerializedEditorState<SerializedLexicalNode>
  readOnly?: boolean
  theme?: EditorThemeClasses
  onContentSubmit?: (
    content: SerializedEditorState<SerializedLexicalNode>
  ) => void
}

const Editor: React.FC<EditorProps> = ({
  namespace,
  preset,
  placeholder = <span />,
  readOnly = false,
  theme,
  onContentSubmit,
}) => {
  const [editorState, setEditorState] = useState<
    SerializedEditorState<SerializedLexicalNode> | undefined
  >(preset)

  const onChange = (state: EditorState) => {
    if (!readOnly) setEditorState(state.toJSON())
  }

  const onError = (error: any) => {
    console.error(error)
  }

  const initialConfig: InitialConfigType = useMemo(
    () => ({
      namespace,
      editable: !readOnly,
      editorState: preset && JSON.stringify(preset, null),
      theme: {
        ...theme,
        root: classNames(
          'flex rounded p-4 outline-1 outline-gray-200 shadow-inner',
          readOnly ? 'bg-gray-50' : 'bg-white',
          theme?.root
        ),
      },
      onError,
    }),
    [namespace, preset, readOnly, theme]
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={placeholder}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {!readOnly ? <OnChangePlugin onChange={onChange} /> : <></>}
      <HistoryPlugin />
      <div
        className={classNames('flex justify-end py-2', readOnly && 'hidden')}
      >
        <button
          className="px-2 py-1 rounded bg-white shadow hover:text-gray-50 hover:bg-gray-800"
          onClick={() => editorState && onContentSubmit?.(editorState)}
        >
          Submit
        </button>
      </div>
    </LexicalComposer>
  )
}

export default Editor
