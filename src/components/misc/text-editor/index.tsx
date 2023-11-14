'use client'

import '@/styles/components/text-editor.sass'

import CancelButtonPlugin from '@/components/misc/text-editor/plugins/cancel-button'
import CodeHighlightPlugin from '@/components/misc/text-editor/plugins/code-highlight'
import ToggleEnablePlugin from '@/components/misc/text-editor/plugins/editable-toggle'
import ToolbarPlugin from '@/components/misc/text-editor/plugins/toolbar'
import UpdateContentPlugin from '@/components/misc/text-editor/plugins/update-content'
import EditorTheme from '@/components/misc/text-editor/theme'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import classNames from 'classnames'
import type {
  EditorState,
  EditorThemeClasses,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical'
import isEqual from 'lodash.isequal'
import { Fragment, useCallback, useMemo, useState } from 'react'

type EditorProps = {
  namespace: string
  placeholder?: Parameters<typeof RichTextPlugin>['0']['placeholder']
  preset?: SerializedEditorState<SerializedLexicalNode>
  value?: SerializedEditorState<SerializedLexicalNode>
  editable?: boolean
  theme?: EditorThemeClasses
  forceCancellation?: boolean
  showCancelButton?: boolean
  cleanAfterSubmit?: boolean
  onCancel?: () => void
  onContentSubmit?: (
    content?: SerializedEditorState<SerializedLexicalNode>,
  ) => void
}

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text)

    if (match === null) {
      return null
    }

    const fullMatch = match[0]

    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
      attributes: { rel: 'noreferrer', target: '_blank' },
    }
  },
]

const Editor = ({
  namespace,
  preset,
  value,
  placeholder = <Fragment />,
  editable = false,
  forceCancellation = false,
  showCancelButton = true,
  cleanAfterSubmit = false,
  theme,
  onCancel,
  onContentSubmit,
}: EditorProps) => {
  const initialState = useMemo(() => preset, [preset])

  const [editorState, setEditorState] = useState<
    SerializedEditorState<SerializedLexicalNode> | undefined
  >(preset)

  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace,
      editable,
      editorState: initialState ? JSON.stringify(initialState) : undefined,
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
      ],
      theme: {
        ...theme,
        ...EditorTheme,
        root: classNames('rounded p-4 shadow-inner bg-white', theme?.root),
      },
      onError: (error) => {
        throw error
      },
    }),
    [namespace, editable, initialState, theme],
  )

  const onChange = useCallback((state: EditorState) => {
    setEditorState(state.toJSON())
  }, [])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative space-y-4 editor-container">
        {editable && <ToolbarPlugin />}

        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                contentEditable="inherit"
              />
            }
            placeholder={placeholder}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <OnChangePlugin onChange={onChange} />

          <HistoryPlugin />

          <AutoFocusPlugin />

          <ListPlugin />

          <LinkPlugin />

          <AutoLinkPlugin matchers={MATCHERS} />

          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

          <UpdateContentPlugin content={value} />

          <ToggleEnablePlugin editable={editable} />

          <CodeHighlightPlugin />

          {/* TODO: integrate drag & drop image insertion and upload modal */}
          {/* <ImagePlugin /> */}
        </div>

        {editable && (
          <div className="flex justify-end gap-2 py-2">
            {showCancelButton && (
              <CancelButtonPlugin
                show={forceCancellation || !isEqual(initialState, editorState)}
                initialState={initialState}
                onCancel={() => {
                  onCancel?.()
                }}
              />
            )}

            {!isEqual(initialState, editorState) && (
              <button
                type="button"
                rel="button"
                className="px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-500"
                onClick={() => {
                  if (editorState) onContentSubmit?.(editorState)

                  if (cleanAfterSubmit) setEditorState(undefined)
                }}
              >
                Submit
              </button>
            )}
          </div>
        )}
      </div>
    </LexicalComposer>
  )
}

export default Editor
