'use client'

import ListBox from '@/components/misc/list-box'
import { getSelectedNode } from '@/components/misc/text-editor/helpers/get-selected-node'
import ToolbarButtonGroup from '@/components/misc/text-editor/plugins/toolbar/button-group'
import Bars3CenterIcon from '@/icons/20/solid/Bars3CenterIcon.svg'
import ArrowUturnLeftIcon from '@heroicons/react/20/solid/ArrowUturnLeftIcon'
import ArrowUturnRightIcon from '@heroicons/react/20/solid/ArrowUturnRightIcon'
import Bars3BottomLeftIcon from '@heroicons/react/20/solid/Bars3BottomLeftIcon'
import Bars3BottomRightIcon from '@heroicons/react/20/solid/Bars3BottomRightIcon'
import Bars3Icon from '@heroicons/react/20/solid/Bars3Icon'
import CodeBracketIcon from '@heroicons/react/20/solid/CodeBracketIcon'
import LinkIcon from '@heroicons/react/20/solid/LinkIcon'
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
  type GridSelection,
  type NodeSelection,
  type RangeSelection,
} from 'lexical'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ListOl as ListOlIcon,
  ListUl as ListUlIcon,
  Quote as QuoteIcon,
  TextParagraph as TextParagraphIcon,
  TypeBold as TypeBoldIcon,
  TypeH1 as TypeH1Icon,
  TypeH2 as TypeH2Icon,
  TypeItalic as TypeItalicIcon,
  TypeStrikethrough as TypeStrikethroughIcon,
  TypeUnderline as TypeUnderlineIcon,
} from 'react-bootstrap-icons'
import { createPortal } from 'react-dom'
import type { NonNegativeInteger } from 'type-fest'

const FloatingLinkEditor = dynamic(
  () => import('@/components/misc/text-editor/elements/floating-link-editor'),
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
}

type BlockType = keyof typeof blockTypeToBlockName | 'code'

type SizeMagnitude = NonNegativeInteger<
  10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
>

type MagnitudeUnit = 'px'

type SizeInPixels = `${SizeMagnitude}${MagnitudeUnit}`

const SUPPORTED_BLOCK_TYPES = new Set<BlockType>(
  Object.keys(blockTypeToBlockName),
)

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
    ['20px', '20px'],
  ),
)

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  const toolbarRef = useRef<HTMLDivElement>(null)

  //#region history handling
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  //#endregion

  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [fontSize, setFontSize] = useState<SizeInPixels>(
    FONT_SIZE_OPTIONS.get('15px')!,
  )

  const [selectedElementKey, setSelectedElementKey] =
    useState<Nullable<string>>(null)

  const [codeLanguage, setCodeLanguage] = useState<string>()

  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)

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
          FONT_SIZE_OPTIONS.get('15px'),
        ) as SizeInPixels,
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
        editorState.read(() => updateToolbar()),
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        LowPriority,
      ),
    )
  }, [editor, updateToolbar])

  const codeLanguages = useMemo(() => getCodeLanguages(), [])

  const insertLink = useCallback(
    () =>
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, !isLink ? 'https://' : null),
    [editor, isLink],
  )

  const transformers = useCallback(
    (selection: Nullable<RangeSelection | GridSelection | NodeSelection>) =>
      ({
        paragraph: () =>
          blockType !== 'paragraph' &&
          editor.update(
            () =>
              $isRangeSelection(selection) &&
              $setBlocksType(selection, () => $createParagraphNode()),
          ),
        h1: () =>
          blockType !== 'h1' &&
          editor.update(
            () =>
              $isRangeSelection(selection) &&
              $setBlocksType(selection, () => $createHeadingNode('h1')),
          ),
        h2: () =>
          blockType !== 'h2' &&
          editor.update(
            () =>
              $isRangeSelection(selection) &&
              $setBlocksType(selection, () => $createHeadingNode('h2')),
          ),
        ul: () =>
          blockType !== 'ul'
            ? editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            : editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined),
        ol: () =>
          blockType !== 'ol'
            ? editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            : editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined),
        quote: () =>
          blockType !== 'quote' &&
          editor.update(
            () =>
              $isRangeSelection(selection) &&
              $setBlocksType(selection, () => $createQuoteNode()),
          ),
        code: () =>
          blockType !== 'code' &&
          editor.update(
            () =>
              $isRangeSelection(selection) &&
              $setBlocksType(selection, () => $createCodeNode()),
          ),
      }) as Record<BlockType, () => void>,
    [blockType, editor],
  )

  return (
    <div
      className="flex flex-wrap align-middle space-x-3 divide-x divide-gray-200 lg:[&>span:not(:first-child)]:pl-3"
      ref={toolbarRef}
    >
      <span className="inline-flex flex-wrap gap-1">
        <button
          type="button"
          className={classNames(
            'inline-flex px-2 justify-between items-center rounded shadow',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
            'disabled:text-gray-400 disabled:bg-gray-50 disabled:border disabled:border-gray-200',
          )}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={classNames(
            'inline-flex px-2 justify-between items-center rounded shadow',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out',
            'disabled:text-gray-400 disabled:bg-gray-50 disabled:border disabled:border-gray-200',
          )}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo"
        >
          <ArrowUturnRightIcon className="h-4 w-4" />
        </button>
      </span>

      {SUPPORTED_BLOCK_TYPES.has(blockType) && (
        <span className="flex flex-wrap w-full lg:w-auto items-center lg:gap-2">
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
              }),
            )}
            onChange={(blockTypeValue) => {
              editor.update(() => {
                transformers($getSelection())[blockTypeValue as BlockType]()

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
              }),
            )}
            onChange={(value) => {
              editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection))
                  $patchStyleText(selection, {
                    'font-size': value,
                  })

                updateToolbar()
              })
            }}
          />
        </span>
      )}

      {isLink &&
        createPortal(
          <FloatingLinkEditor editor={editor} LowPriority={LowPriority} />,
          document.body,
        )}

      {blockType !== 'code' ? (
        <Fragment>
          <ToolbarButtonGroup
            controls={[
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
                label: 'Format Bold',
                title: 'Bold',
                icon: <TypeBoldIcon className="h-4 w-4" />,
                isActive: isBold,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
                label: 'Format Italics',
                title: 'Italic',
                icon: <TypeItalicIcon className="h-4 w-4" />,
                isActive: isItalic,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'),
                label: 'Format Underline',
                title: 'Underline',
                icon: <TypeUnderlineIcon className="h-4 w-4" />,
                isActive: isUnderline,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
                label: 'Format Strikethrough',
                title: 'Strikethrough',
                icon: <TypeStrikethroughIcon className="h-4 w-4" />,
                isActive: isStrikethrough,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'),
                label: 'Insert Code',
                title: 'Code block',
                icon: <CodeBracketIcon className="h-4 w-4" />,
                isActive: isCode,
              },
              {
                action: insertLink,
                label: 'Insert Link',
                title: 'Link',
                icon: <LinkIcon className="h-4 w-4" />,
                isActive: isLink,
              },
            ]}
          />

          <ToolbarButtonGroup
            controls={[
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
                label: 'Align Left',
                title: 'Align Left',
                icon: <Bars3BottomLeftIcon className="h-4 w-4" />,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
                label: 'Align Center',
                title: 'Align Center',
                icon: (
                  <Image src={Bars3CenterIcon} className="h-4 w-4" alt="" />
                ),
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
                label: 'Align Right',
                title: 'Align Right',
                icon: <Bars3BottomRightIcon className="h-4 w-4" />,
              },
              {
                action: () =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
                label: 'Justify',
                title: 'Justify',
                icon: <Bars3Icon className="h-4 w-4" />,
              },
            ]}
          />

          {/* TODO: integrate drag & drop image insertion and upload modal */}
          {/* <ToolbarButtonGroup
            controls={[
              {
                action: () => void 0,
                label: 'Insert Image',
                title: 'Insert Image',
                icon: <PhotoIcon className="h-4 w-4" />,
              },
            ]}
          /> */}
        </Fragment>
      ) : (
        <span className="inline-flex flex-wrap w-full lg:w-auto items-center lg:gap-2">
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
        </span>
      )}
    </div>
  )
}

export default ToolbarPlugin
