import { ESCAPE_CODE, Terminal } from "."
import { Coor } from "./Coordinate"

export class Cursor {
  private cursorLocations: Coor[] = [new Coor(0, 0)]
  private cursorLocationsCurrentIndex: number = 0
  cursorLocationsLengthLimit = 25

  constructor(
    private write: (str: string, isEscaped: boolean) => void,
    private width: () => number
  ) {
    this.style.resetAll()
    this.color.reset()

  }


  default = {
    fgColor: () => this.color.foreground.set.rgb(255, 255, 255),
    bgColor: () => this.color.background.set.rgb(0, 0, 0)
  }

  moveCursorToCurrentLocation() {
    const location = this.cursorLocations[this.cursorLocationsCurrentIndex]
    this.write(`\u001b[${location.y};${location.x}H`, true)
  }

  move = { // TODO: add by, allowing postive/negative x and y input
    by: (x: number, y: number) => {
      const { location } = this
      location.set(
        location.x() + x,
        location.y() + y
      )
    },
    up: (times: number = 1) => {
      const { location } = this
      location.set(
        location.x(),
        location.y() - times
      )
    },
    right: (times: number = 1) => {
      const { location } = this
      location.set(
        location.x() + times ,
        location.y()
      )
    },
    down: (times: number = 1) => {
      const { location } = this
      location.set(
        location.x(),
        location.y() + times
      )
    },
    left: (times: number = 1) => {
      const { location } = this
      location.set(
        location.x() - times,
        location.y()
      )
    },
  }

  location = {
    current: () => {
      const current = this.cursorLocations[this.cursorLocationsCurrentIndex]
      if (!current) throw new Error("No current cursor location exists")
      return current
    },
    x: () => {
      return this.location.current().x
    },
    y: () => {
      return this.location.current().y
    },
    set: (x: number, y: number) => {
      this.cursorLocations = [new Coor(x, y), ...this.cursorLocations.slice(0, this.cursorLocationsLengthLimit)]
      this.cursorLocationsCurrentIndex = 0
      this.moveCursorToCurrentLocation()
    },
    history: {
      forward: () => {
        if (this.cursorLocationsCurrentIndex > 0) {
          this.cursorLocationsCurrentIndex--
          this.moveCursorToCurrentLocation()
        }
      },
      backward: () => {
        if (this.cursorLocationsCurrentIndex < this.cursorLocations.length) {
          this.cursorLocationsCurrentIndex++
          this.moveCursorToCurrentLocation()
        }
      }
    }
  }

  private isBold: boolean
  private isDim: boolean
  private isItalic: boolean
  private isUnderline: boolean
  private isBlinking: boolean
  private isInverse: boolean
  private isHidden: boolean
  private isStrikethrough: boolean

  private writeStyle(style: string) {
    this.write(
      `${ESCAPE_CODE}${style}m`,
      true
    )
  }
  
  style = {
    resetAll: () => {
      this.writeStyle(StyleCode.ResetAll)
      this.isBold,
      this.isDim,
      this.isItalic,
      this.isUnderline,
      this.isBlinking,
      this.isInverse,
      this.isHidden,
      this.isStrikethrough = false
    },
    set: {
      bold: {
        on: () => {
          if (!this.isBold) {
            this.writeStyle(StyleCode.Bold)
            this.isBold = true
          }
        },
        off: () => {
          if (this.isBold) {
            this.writeStyle(StyleCode.ResetBold),
            this.isBold = false
          }
        }
      },
      dim: {
        on: () => {
          if (!this.isDim) {
            this.writeStyle(StyleCode.Dim)
            this.isDim = true
          }
        },
        off: () => {
          if (this.isDim) {
            this.writeStyle(StyleCode.ResetDim)
            this.isDim = false
          }
        }
      },
      italic: {
        on: () => {
          if (!this.isItalic) {
            this.writeStyle(StyleCode.Italic)
            this.isItalic = true
          }
        },
        off: () => {
          if (this.isItalic) {
            this.writeStyle(StyleCode.ResetItalic)
            this.isItalic = false
          }
        }
      },
      underline: {
        on: () => {
          if (!this.isUnderline) {
            this.writeStyle(StyleCode.Underline)
            this.isUnderline = true
          }
        },
        off: () => {
          if (this.isUnderline) {
            this.writeStyle(StyleCode.ResetUnderline)
            this.isUnderline = false
          }
        }
      },
      blinking: { // doesn't appear to work in iTerm
        on: () => {
          if (!this.isBlinking) {
            this.writeStyle(StyleCode.Blinking)
            this.isBlinking = true
          }
        },
        off: () => {
          if (this.isBlinking) {
            this.writeStyle(StyleCode.ResetBlinking)
            this.isBlinking = false
          }
        }
      },
      inverse: {
        on: () => {
          if (!this.isInverse) {
            this.writeStyle(StyleCode.Inverse)
            this.isInverse = true
          }
        },
        off: () => {
          if (this.isInverse) {
            this.writeStyle(StyleCode.ResetInverse)
            this.isInverse = false
          }
        }
      },
      hidden: { // doesn't appear to work in iTerm
        on: () => {
          if (!this.isHidden) {
            this.writeStyle(StyleCode.Hidden)
            this.isHidden = true
          }
        },
        off: () => {
          if (this.isHidden) {
            this.writeStyle(StyleCode.ResetHidden)
            this.isHidden = false
          }
        }
      },
      strikethrough: {
        on: () => {
          if (!this.isStrikethrough) {
            this.writeStyle(StyleCode.Strikethrough)
            this.isStrikethrough = true
          }
        },
        off: () => {
          if (this.isStrikethrough) {
            this.writeStyle(StyleCode.ResetStrikethrough)
            this.isStrikethrough = false
          }
        }
      }
    }
  }

  private currentForegroundColor = ''
  private currentBackgroundColor = ''

  color = {
    reset: () => {
      this.default.bgColor()
      this.default.fgColor()
    },
    foreground: {
      set: {
        rgb: (r: number, g: number, b: number) => {
          const c = `\u001b[38;2;${r};${g};${b}m`
          if (c !== this.currentForegroundColor) {
            this.write(c, true)
            this.currentForegroundColor = c
          }
        }
      }
    },
    background: {
      set: {
        rgb: (r: number, g: number, b: number) => {
          const c = `\u001b[48;2;${r};${g};${b}m`
          if (c !== this.currentBackgroundColor) {
            this.write(c, true)
            this.currentBackgroundColor = c
          }
        }
      }
    }
  }

}

enum StyleCode {
  ResetAll = '0',
  Bold = '1',
  ResetBold = '22',
  Dim = '2',
  ResetDim = '22',
  Italic = '3',
  ResetItalic = '23',
  Underline = '4',
  ResetUnderline = '24',
  Blinking = '5',
  ResetBlinking = '25',
  Inverse = '7',
  ResetInverse = '27',
  Hidden = '8',
  ResetHidden = '28',
  Strikethrough = '9',
  ResetStrikethrough = '29'
}