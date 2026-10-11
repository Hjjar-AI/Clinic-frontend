import { afterEach, describe, it, expect } from 'vitest'
import { registerOverlay, hasActiveOverlay } from '@/services/overlayStack'

let releases = []
afterEach(() => { for (const release of releases.reverse()) release(); releases = [] })
function control(label, disabled = false) {
  const button = document.createElement('button')
  button.textContent = label
  button.disabled = disabled
  button.getClientRects = () => disabled ? [] : [{ width: 30, height: 20 }]
  return button
}
function overlay(priority = 1000) {
  const element = document.createElement('div')
  element.tabIndex = -1
  const first = control('First'), disabled = control('Disabled', true), last = control('Last')
  element.append(first, disabled, last)
  document.body.append(element)
  let release
  release = registerOverlay({ element, priority, close: () => { release(); element.remove() } })
  releases.push(release)
  return { element, first, last, release }
}
const key = (name, shiftKey = false) => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true, cancelable: true }))

describe('shared overlay focus and ownership', () => {
  it('Tab and Shift+Tab wrap around enabled controls', () => {
    const { first, last } = overlay()
    expect(document.activeElement).toBe(first)
    key('Tab', true)
    expect(document.activeElement).toBe(last)
    key('Tab')
    expect(document.activeElement).toBe(first)
  })

  it('background controls become inert and attempted outside focus returns inside', () => {
    const outside = control('Outside')
    document.body.append(outside)
    const { first, release } = overlay()
    expect(outside.inert).toBe(true)
    outside.focus()
    expect(document.activeElement).toBe(first)
    release()
    expect(outside.inert).not.toBe(true)
  })

  it('Escape releases only the top overlay and restores nested then original focus', () => {
    const trigger = control('Open drawer')
    document.body.append(trigger)
    trigger.focus()
    const drawer = overlay(600)
    drawer.last.focus()
    const modal = overlay(1000)
    expect(document.activeElement).toBe(modal.first)
    key('Escape')
    expect(modal.element.isConnected).toBe(false)
    expect(drawer.element.isConnected).toBe(true)
    expect(document.activeElement).toBe(drawer.last)
    expect(document.body.style.overflow).toBe('hidden')
    key('Escape')
    expect(document.activeElement).toBe(trigger)
    expect(hasActiveOverlay()).toBe(false)
  })

  it('out-of-order release preserves the active overlay scroll lock and focus', () => {
    document.body.style.overflow = 'auto'
    const lower = overlay(600)
    const upper = overlay(1000)
    lower.release()
    expect(document.activeElement).toBe(upper.first)
    expect(document.body.style.overflow).toBe('hidden')
    upper.release()
    upper.release()
    expect(document.body.style.overflow).toBe('auto')
    expect(hasActiveOverlay()).toBe(false)
  })

  it('an overlay with no controls receives focus and traps Tab itself', () => {
    const element = document.createElement('div')
    element.tabIndex = -1
    document.body.append(element)
    const release = registerOverlay({ element })
    releases.push(release)
    expect(document.activeElement).toBe(element)
    key('Tab')
    expect(document.activeElement).toBe(element)
  })
})
