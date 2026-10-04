import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export function ResponsiveSelect({
  value,
  onChange,
  options,
  placeholder = 'Select Category',
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{
    top?: number
    bottom?: number
    left: number
    width: number
    maxHeight: number
  }>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 220,
  })

  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updateMenuPosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const viewportPadding = 12
    const gap = 8

    // Five issue choices + the placeholder. Keep the menu compact enough
    // to fit on small phones while still making every option readable.
    const desiredHeight = Math.min(220, (options.length + 1) * 38 + 10)

    // The menu is portalled to <body>, so its position must be calculated
    // against the viewport, not against the Help card.
    // Keep the menu exactly the same width as the trigger so its left and
    // right edges stay aligned with the field on every device.
    const width = Math.min(
      rect.width,
      viewportWidth - viewportPadding * 2,
    )

    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      viewportWidth - width - viewportPadding,
    )

    const spaceAbove = Math.max(0, rect.top - viewportPadding - gap)
    const spaceBelow = Math.max(0, viewportHeight - rect.bottom - viewportPadding - gap)
    const isMobile = viewportWidth <= 768

    if (isMobile) {
      // MOBILE: explicitly position the menu ABOVE the trigger.
      // Do not use CSS `bottom` here because browser mobile emulation can
      // report the visual viewport differently from the layout viewport.
      const height = Math.min(desiredHeight, spaceAbove)
      const safeHeight = Math.max(120, height)
      const top = Math.max(
        viewportPadding,
        rect.top - safeHeight - gap,
      )

      setMenuPosition({
        top,
        left,
        width,
        maxHeight: Math.min(safeHeight, viewportHeight - top - viewportPadding),
      })
      return
    }

    // TABLET/DESKTOP: open below when there is enough room; otherwise open above.
    const openAbove =
      spaceBelow < desiredHeight && spaceAbove > spaceBelow

    if (openAbove) {
      const height = Math.min(desiredHeight, spaceAbove)
      setMenuPosition({
        top: Math.max(viewportPadding, rect.top - height - gap),
        left,
        width,
        maxHeight: Math.max(80, height),
      })
    } else {
      const height = Math.min(desiredHeight, spaceBelow)
      setMenuPosition({
        top: rect.bottom + gap,
        left,
        width,
        maxHeight: Math.max(80, height),
      })
    }
  }

  const openMenu = () => {
    updateMenuPosition()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    // Recalculate after the portal has been mounted as well as on viewport changes.
    requestAnimationFrame(updateMenuPosition)

    const handleViewportChange = () => updateMenuPosition()
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node

      if (
        selectRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }

      setOpen(false)
    }

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    document.addEventListener('pointerdown', handleOutsidePointer)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
      document.removeEventListener('pointerdown', handleOutsidePointer)
    }
  }, [open, options.length])

  const selectValue = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="responsive-select-menu"
          role="listbox"
          style={{
            position: 'fixed',
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            left: menuPosition.left,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
            maxWidth: 'calc(100vw - 16px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 99999,
          }}
        >
          <button
            type="button"
            className={`responsive-select-option ${!value ? 'selected' : ''}`}
            onPointerDown={(event) => {
              event.preventDefault()
              selectValue('')
            }}
          >
            {placeholder}
          </button>

          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`responsive-select-option ${value === option ? 'selected' : ''}`}
              onPointerDown={(event) => {
                event.preventDefault()
                selectValue(option)
              }}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <div
        ref={selectRef}
        className={`responsive-select ${open ? 'open' : ''}`}
      >
        <button
          ref={triggerRef}
          type="button"
          className="responsive-select-trigger"
          onClick={() => {
            if (open) {
              setOpen(false)
            } else {
              openMenu()
            }
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={!value ? 'placeholder' : ''}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`responsive-select-arrow ${open ? 'rotated' : ''}`}
          />
        </button>
      </div>
      {menu}
    </>
  )
}



export const CustomSelect = ResponsiveSelect
export default ResponsiveSelect
