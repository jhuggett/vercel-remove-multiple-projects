import { ESCAPE_CODE } from "."
import { Cursor } from "./cursor"

export class Terminal {  

  width = (): number => {
    return process.stdout.columns || 0
  }

  height = () => {
      return process.stdout.rows || 0
  }

  cursor: Cursor = new Cursor(this.write, this.width)
  
  write(content: string, escaped = false, wrap = true) {
    let contentToWrite = content
    if (!wrap) {
      contentToWrite = content.split('').slice(0, content.length - (this.cursor.location.current().x + content.length - this.width())).join('')
    }
    if (!escaped) {
      const moveAmount = content.length
      const xResult = this.cursor.location.x() + moveAmount

      const current = this.cursor.location.current()
      current.x = xResult % this.width()
      current.y += Math.floor(xResult / this.width())
    }
    process.stdout.write(contentToWrite)
  }

  return(times = 1) {
    this.cursor.location.set(0, this.cursor.location.y() + times)
  }

  setRawMode(to: boolean) {
    process.stdin.setRawMode(to)
  }

  hideCursor() {
    this.write(
      ESCAPE_CODE + EscapeCodes.MakeCursorInvisible,
      true
    )
  }

  showCursor() {
    this.write(
      ESCAPE_CODE + EscapeCodes.MakeCursorVisible,
      true
    )
  }

  clearScreen() {
    this.write(
      ESCAPE_CODE + EscapeCodes.EraseEntireScreen,
      true
    )
    this.cursor.location.set(0, 0)
  }
}


export enum EscapeCodes {
  EraseFromCursorToEndOfScreen = '0J',
  EraseFromCursorToBeginningOfScreen = '1J',
  EraseEntireScreen = '2J',
  EraseFromCursorToEndOfLine = '0K',
  EraseFromCursorToStartOfLine = '1K',
  EraseEntireLine = '2K',

  // Private Modes:
  MakeCursorInvisible = '?25l',
  MakeCursorVisible = '?25h',
  RestoreScreen = '?47l',
  SaveScreen = '?47h'
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}