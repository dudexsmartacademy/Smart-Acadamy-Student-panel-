import { createPortal } from 'react-dom'
import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export function AttendanceSubjectSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const gap = 6
    const edgePadding = 10
    const preferredHeight = Math.min(240, 10 + (options.length + 1) * 40)
    const spaceBelow = Math.max(0, viewportHeight - rect.bottom - edgePadding - gap)
    const spaceAbove = Math.max(0, rect.top - edgePadding - gap)
    const openAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow
    const availableHeight = Math.max(80, Math.min(preferredHeight, openAbove ? spaceAbove : spaceBelow))
    const width = Math.min(rect.width, viewportWidth - edgePadding * 2)
    const left = Math.min(Math.max(rect.left, edgePadding), viewportWidth - width - edgePadding)

    setMenuPosition({
      position: 'fixed',
      left,
      width,
      zIndex: 10000,
      maxHeight: availableHeight,
      ...(openAbove
        ? { bottom: viewportHeight - rect.top + gap, top: 'auto' }
        : { top: rect.bottom + gap, bottom: 'auto' }),
    })
  }

  useEffect(() => {
    if (!open) return

    updateMenuPosition()
    const handleViewportChange = () => updateMenuPosition()
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, options.length])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        !target.closest('.attendance-custom-select') &&
        !target.closest('.attendance-custom-select-menu')
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const selectedLabel = value || 'Select a subject'
  const menu = open ? (
    <div
      className="attendance-custom-select-menu"
      style={menuPosition}
      role="listbox"
      aria-label="Attendance subjects"
    >
      <button
        type="button"
        role="option"
        aria-selected={!value}
        className={`attendance-custom-select-option ${!value ? 'selected' : ''}`}
        onClick={() => {
          onChange('')
          setOpen(false)
        }}
      >
        Select a subject
      </button>
      {options.map((option) => (
        <button
          type="button"
          role="option"
          aria-selected={value === option}
          key={option}
          className={`attendance-custom-select-option ${value === option ? 'selected' : ''}`}
          onClick={() => {
            onChange(option)
            setOpen(false)
          }}
        >
          {option}
        </button>
      ))}
    </div>
  ) : null

  return (
    <div className={`attendance-custom-select ${open ? 'is-open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="attendance-custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  )
}

export default AttendanceSubjectSelect
