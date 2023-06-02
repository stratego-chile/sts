'use client'

import ListBox from '@/components/misc/list-box'
import { getSelectedNode } from '@/components/misc/text-editor/helpers/get-selected-node'
import {
  $createCodeNode,
  $isCodeNode,
  getCodeLanguages,
  getDefaultCodeLanguage,
  getLanguageFriendlyName,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text'
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import classNames from 'classnames'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type CommandListenerPriority,
} from 'lexical'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowClockwise as ArrowClockwiseIcon,
  ArrowCounterclockwise as ArrowCounterclockwiseIcon,
  Code as CodeIcon,
  Justify as JustifyIcon,
  JustifyLeft as JustifyLeftIcon,
  JustifyRight as JustifyRightIcon,
  Link as LinkIcon,
  ListOl as ListOlIcon,
  ListUl as ListUlIcon,
  Quote as QuoteIcon,
  TextCenter as TextCenterIcon,
  TextParagraph as TextParagraphIcon,
  TypeBold as TypeBoldIcon,
  TypeH1 as TypeH1Icon,
  TypeH2 as TypeH2Icon,
  TypeItalic as TypeItalicIcon,
  TypeStrikethrough as TypeStrikethroughIcon,
  TypeUnderline as TypeUnderlineIcon,
} from 'react-bootstrap-icons'
import { createPortal } from 'react-dom'

const FloatingLinkEditor = dynamic(
  () => import('@/components/misc/text-editor/elements/floating-link-editor')
)

const LowPriority: CommandListenerPriority = 1

const blockTypeToBlockName = {
  paragraph: {
    label: 'Normal',
    icon: <TextParagraphIcon />,
  },
  h1: {
    label: 'Large Heading',
    icon: <TypeH1Icon />,
  },
  h2: {
    label: 'Small Heading',
    icon: <TypeH2Icon />,
  },
  ol: {
    label: 'Numbered List',
    icon: <ListOlIcon />,
  },
  ul: {
    label: 'Bullet List',
    icon: <ListUlIcon />,
  },
  quote: {
    label: 'Quote',
    icon: <QuoteIcon />,
  },
  code: {
    label: 'Code Block',
    icon: <CodeIcon />,
  },
}

type BlockType = keyof typeof blockTypeToBlockName

type SizeInPixels = `${number}px`

const SUPPORTED_BLOCK_TYPES = new Set<BlockType>([
  'paragraph',
  'quote',
  'h1',
  'h2',
  'ul',
  'ol',
  'code',
])

const FONT_SIZE_OPTIONS = new Map<SizeInPixels, SizeInPixels>(
  Array.of(
    ['10px', '10px'],
    ['11px', '11px'],
    ['12px', '12px'],
    ['13px', '13px'],
    ['14px', '14px'],
    ['15px', '15px'],
    ['16px', '16px'],
    ['17px', '17px'],
    ['18px', '18px'],
    ['19px', '19px'],
    ['20px', '20px']
  )
)

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  const toolbarRef = useRef<HTMLDivElement>(null)

  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [fontSize, setFontSize] = useState<SizeInPixels>('15px')
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  )
  const [codeLanguage, setCodeLanguage] = useState<string>()
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey)

        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList.getTag() : element.getTag()

          setBlockType(type)
        } else {
          const type = (
            $isHeadingNode(element) ? element.getTag() : element.getType()
          ) as BlockType

          setBlockType(type)

          if ($isCodeNode(element))
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage())
        }
      }

      // Update font size
      setFontSize(
        $getSelectionStyleValueForProperty(
          selection,
          'font-size',
          '15px'
        ) as SizeInPixels
      )

      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()

      if ($isLinkNode(parent) || $isLinkNode(node)) setIsLink(true)
      else setIsLink(false)
    }
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) =>
        editorState.read(() => updateToolbar())
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        LowPriority
      )
    )
  }, [editor, updateToolbar])

  const codeLanguages = useMemo(() => getCodeLanguages(), [])

  const insertLink = useCallback(
    () =>
      !isLink
        ? editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
        : editor.dispatchCommand(TOGGLE_LINK_COMMAND, null),
    [editor, isLink]
  )

  return (
    <div
      className="flex flex-col lg:flex-row align-middle text-lg lg:gap-1"
      ref={toolbarRef}
    >
      <span className="inline-flex">
        <button
          type="button"
          className={classNames(
            'inline-flex gap-2 px-2 justify-between items-center rounded',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
            'disabled:text-gray-400 disabled:hover:bg-inherit disabled:cursor-default'
          )}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <ArrowCounterclockwiseIcon />
        </button>

        <button
          type="button"
          className={classNames(
            'inline-flex gap-2 px-2 justify-between items-center rounded',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
            'disabled:text-gray-400 disabled:hover:bg-inherit disabled:cursor-default'
          )}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <ArrowClockwiseIcon />
        </button>
      </span>

      <span className="hidden lg:inline-flex w-px bg-gray-200 mx-1" />

      {SUPPORTED_BLOCK_TYPES.has(blockType) && (
        <>
          <ListBox
            value={blockType}
            options={Object.entries(blockTypeToBlockName).map(
              ([blockTypeKey, option]) => ({
                label: (
                  <span className="inline-flex gap-2 justify-between items-center">
                    <span>{option.icon}</span>

                    <span>{option.label}</span>
                  </span>
                ),
                value: blockTypeKey,
              })
            )}
            onChange={(blockTypeValue) => {
              editor.update(() => {
                const selection = $getSelection()

                const transformers: Record<BlockType, () => void> = {
                  paragraph: () =>
                    blockType !== 'paragraph' &&
                    editor.update(
                      () =>
                        $isRangeSelection(selection) &&
                        $setBlocksType(selection, () => $createParagraphNode())
                    ),
                  h1: () =>
                    blockType !== 'h1' &&
                    editor.update(
                      () =>
                        $isRangeSelection(selection) &&
                        $setBlocksType(selection, () =>
                          $createHeadingNode('h1')
                        )
                    ),
                  h2: () =>
                    blockType !== 'h2' &&
                    editor.update(
                      () =>
                        $isRangeSelection(selection) &&
                        $setBlocksType(selection, () =>
                          $createHeadingNode('h2')
                        )
                    ),
                  ul: () =>
                    blockType !== 'ul'
                      ? editor.dispatchCommand(
                          INSERT_UNORDERED_LIST_COMMAND,
                          undefined
                        )
                      : editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined),
                  ol: () =>
                    blockType !== 'ol'
                      ? editor.dispatchCommand(
                          INSERT_ORDERED_LIST_COMMAND,
                          undefined
                        )
                      : editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined),
                  quote: () =>
                    blockType !== 'quote' &&
                    editor.update(
                      () =>
                        $isRangeSelection(selection) &&
                        $setBlocksType(selection, () => $createQuoteNode())
                    ),
                  code: () =>
                    blockType !== 'code' &&
                    editor.update(
                      () =>
                        $isRangeSelection(selection) &&
                        $setBlocksType(selection, () => $createCodeNode())
                    ),
                }

                transformers[blockTypeValue as BlockType]()

                updateToolbar()
              })
            }}
          />

          <ListBox
            value={fontSize}
            options={Array.from(FONT_SIZE_OPTIONS.entries()).map(
              ([label, value]) => ({
                label,
                value,
              })
            )}
            onChange={(value) => {
              editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection))
                  $patchStyleText(selection, {
                    'font-size':
                      typeof value === 'number' ? `${value}px` : value,
                  })

                updateToolbar()
              })
            }}
          />

          <span className="hidden lg:inline-flex w-px bg-gray-200 mx-1" />
        </>
      )}

      {blockType === 'code' ? (
        <ListBox
          value={codeLanguage}
          onChange={($codeLanguage) =>
            editor.update(() => {
              if (selectedElementKey !== null) {
                const node = $getNodeByKey(selectedElementKey)

                if ($isCodeNode(node)) node.setLanguage($codeLanguage)
              }
            })
          }
          options={codeLanguages.map((codeLang) => ({
            label: getLanguageFriendlyName(codeLang),
            value: codeLang,
          }))}
        />
      ) : (
        <span className="flex flex-wrap items-center lg:gap-1">
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            }}
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isBold && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Format Bold"
          >
            <TypeBoldIcon />
          </button>

          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }}
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isItalic && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Format Italics"
          >
            <TypeItalicIcon />
          </button>

          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }}
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isUnderline && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Format Underline"
          >
            <TypeUnderlineIcon />
          </button>

          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isStrikethrough && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Format Strikethrough"
          >
            <TypeStrikethroughIcon />
          </button>

          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isCode && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Insert Code"
          >
            <CodeIcon />
          </button>

          <button
            onClick={insertLink}
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
              isLink && 'bg-gray-200 bg-opacity-60'
            )}
            aria-label="Insert Link"
          >
            <LinkIcon />
          </button>

          {isLink &&
            createPortal(
              <FloatingLinkEditor editor={editor} LowPriority={LowPriority} />,
              document.body
            )}

          <span className="hidden lg:inline-flex h-full w-px bg-gray-200 mx-1" />

          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
            }
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
            )}
            aria-label="Left Align"
          >
            <JustifyLeftIcon />
          </button>

          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
            }
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
            )}
            aria-label="Center Align"
          >
            <TextCenterIcon />
          </button>

          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
            }
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
            )}
            aria-label="Right Align"
          >
            <JustifyRightIcon />
          </button>

          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
            }
            className={classNames(
              'inline-flex p-2 justify-between items-center rounded',
              'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
            )}
            aria-label="Justify Align"
          >
            <JustifyIcon />
          </button>
        </span>
      )}
    </div>
  )
}

export default ToolbarPlugin
