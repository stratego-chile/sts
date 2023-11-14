import ColoredUserIcon from '@/components/user/colored-icon'
import chroma from 'chroma-js'
import classNames from 'classnames'
import { HexColorPicker } from 'react-colorful'

type ProfileIconColorPickerProps = {
  value?: string
  onChange?: (newColor: string) => void
  submitting?: boolean
  coloredIconCharacter?: string
}

const ProfileIconColorPicker = ({
  value: currentHexColor,
  onChange,
  submitting,
  coloredIconCharacter,
}: ProfileIconColorPickerProps) => {
  return (
    <div className="inline-flex flex-col lg:flex-row gap-16">
      <div className="inline-flex flex-col items-center gap-4">
        <HexColorPicker
          color={currentHexColor}
          onChange={(newColor) => onChange?.(newColor)}
          aria-disabled={submitting}
        />

        <button
          type="button"
          className={classNames(
            'text-sm px-2 py-1 rounded text-gray-50 bg-gray-900',
            'hover:bg-gray-700 transition ease-in-out duration-200',
          )}
          onClick={() => onChange?.(chroma.random().hex().toUpperCase())}
          disabled={submitting}
        >
          Random color
        </button>
      </div>

      <div className="inline-flex flex-col gap-4 items-center justify-center">
        <ColoredUserIcon
          color={currentHexColor}
          content={coloredIconCharacter ?? ''}
          size={8}
          sizeUnit="em"
        />

        {currentHexColor && (
          <span className="inline-flex justify-between items-center p-1 bg-gray-200 text-gray-500 rounded">
            <span className="px-2 select-all text-xs">
              {currentHexColor.toUpperCase()}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

export default ProfileIconColorPicker
