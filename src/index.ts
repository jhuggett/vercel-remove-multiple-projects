#!/usr/bin/env node

import { input, keypress, Keys, Terminal } from "./Terminal"
import { exec, ExecException } from "child_process"
import { spawn } from "cross-spawn"

export interface CommandExecutionResult {
  stdout: string
  error?: ExecException,
  stderr?: string
}

async function execute(command: string) : Promise<CommandExecutionResult> {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        stdout,
        error,
        stderr
      })
    })
  })
}

interface Project {
  index: number
  name: string
  selected: boolean
}

function renderProjectList(
  terminal: Terminal,
  projects: Project[],
  current: Project
) {
  terminal.clearScreen()
  terminal.return()
  terminal.write(`Here's all ${projects.length} of your projects.`)
  terminal.return()
  
  terminal.write("Navigate up and down with the ")
  terminal.cursor.color.foreground.set.rgb(0, 250, 200)
  terminal.write(`arrow keys`)
  terminal.cursor.color.reset()
  terminal.write('.')
  terminal.return()

  terminal.write("To select or deselect a project, press ")
  terminal.cursor.color.foreground.set.rgb(200, 250, 0)
  terminal.write(`space`)
  terminal.cursor.color.reset()
  terminal.write('.')
  terminal.return()

  terminal.write('To continue to the next step, press ')
  terminal.cursor.color.foreground.set.rgb(250, 0, 0)
  terminal.write(`enter`)
  terminal.cursor.color.reset()
  terminal.write('.')
  terminal.return()

  const rowsAvailible = terminal.height() - terminal.cursor.location.y()
  const rowsEitherSide = Math.floor((rowsAvailible - 5) / 2)



  let start = Math.max(0, current.index - rowsEitherSide)
  let end = Math.min(projects.length, current.index + rowsEitherSide)

  const upUnused = current.index - rowsEitherSide
  const downUnused = current.index + rowsEitherSide

  if (upUnused < 0) {
    end = Math.min(projects.length, end + Math.abs(upUnused))
  }

  if (downUnused > projects.length) {
    start = Math.max(0, start - (downUnused - projects.length))
  }

  for (let project of projects.slice(start, end)) {
    terminal.return()

    if (project.selected) {
      terminal.cursor.color.foreground.set.rgb(250, 0, 0)
    }

    if (current.index === project.index) {
      terminal.cursor.style.set.bold.on()
      terminal.cursor.style.set.italic.on()
    }

    terminal.write(`${project.index === current.index ? '--> ' : '    '}${project.index}. ${project.name}`)

    terminal.cursor.color.reset()
    terminal.cursor.style.resetAll()
  }
}


function logCommand(command: string, terminal: Terminal) {
  terminal.cursor.color.foreground.set.rgb(0, 250, 0)
  console.log(`\nrunning: ${command}\n`);
  terminal.cursor.color.reset()
}

(async () => {
  const terminal = new Terminal() 
  const { style } = terminal.cursor
  const { color } = terminal.cursor
  terminal.hideCursor()

  terminal.clearScreen()
  color.reset()

  color.foreground.set.rgb(250, 100, 25)

  style.set.bold.on()
  style.set.underline.on()
  terminal.write("DVPHT")
  style.set.underline.off()
  terminal.write(": Delete Vercel Projects Helper Tool")
  terminal.return()
  style.resetAll()
  color.reset()

  terminal.return(3)
  terminal.write("Here's the steps we're going to take:")
  terminal.return(2)

  terminal.cursor.move.right(3)
  style.set.bold.on()
  style.set.italic.on()
  color.foreground.set.rgb(200, 200, 25)
  terminal.write("1)")
  
  style.resetAll()
  color.reset()

  terminal.write(" first, we'll run ")
  color.foreground.set.rgb(0, 250, 0)
  terminal.write("`vercel whoami`")
  color.reset()
  terminal.write(" to authenticate with Vercel.")

  terminal.return(2)

  terminal.cursor.move.right(3)
  style.set.bold.on()
  style.set.italic.on()
  color.foreground.set.rgb(200, 200, 25)
  terminal.write("2)")
  
  style.resetAll()
  color.reset()

  terminal.write(" then ")
  color.foreground.set.rgb(0, 250, 0)
  terminal.write("`vercel projects`")
  color.reset()
  terminal.write(" to gather all your project names. If you have more than a few projects, we'll have to run said command for each page of projects.")

  terminal.return(2)

  terminal.cursor.move.right(3)
  style.set.bold.on()
  style.set.italic.on()
  color.foreground.set.rgb(200, 200, 25)
  terminal.write("3)")
  
  style.resetAll()
  color.reset()

  terminal.write(" next, we'll show you a list of all your projects, and you can select each project you want deleted.")

  terminal.return(2)

  terminal.cursor.move.right(3)
  style.set.bold.on()
  style.set.italic.on()
  color.foreground.set.rgb(200, 200, 25)
  terminal.write("4)")
  
  style.resetAll()
  color.reset()

  terminal.write(" and finally, we'll run ")
  color.foreground.set.rgb(0, 250, 0)
  terminal.write("`vercel remove`")
  color.reset()
  terminal.write(" for every project you seleted. ")
  color.foreground.set.rgb(250, 250, 0)
  terminal.write("Note")
  color.reset()
  terminal.write(", for each project, you will be prompted to confirm you do indeed want to delete it.")

  terminal.return(3)

  terminal.write("Press ")
  color.foreground.set.rgb(0, 250, 0)
  terminal.write("any key")
  color.reset()
  terminal.write(" to continue, or ")
  color.foreground.set.rgb(250, 0, 0)
  terminal.write("escape")
  color.reset()
  terminal.write(" to stop here")


  ;(await input({
    targets: [
      {
        key: Keys.Escape,
        call: () => {
          process.exit()
        }
      },
      {
        key: '*',
        call: () => null
      }
    ]
  }))()

  terminal.clearScreen()
  
  logCommand("vercel whoami", terminal)

  spawn.sync(
    'vercel',
    [
      'whoami'
    ],
    {
      stdio: 'inherit'
    }
  )

  let command = "vercel projects"

  let projectOutput: string[] = []

  while (command) {
    logCommand(command, terminal)
    
    const output = (await execute(
      command
    )).stdout.split('\n')

    output.pop() // get rid of empty line at end

    console.log(output.join('\n'));
    
    const lastLine = output[output.length - 1]

    projectOutput.push(...output)

    if (lastLine.includes('next page')) {
      command = lastLine.split('`')[1]
    } else {
      command = null
    }
  }

  let allProjects: Project[] = []
  let i = 0

  for (let line of projectOutput) {
    line = line.trim()
    if (line.includes('ago')) {
      allProjects.push({
        index: i,
        name: line.split(' ')[0],
        selected: false
      })
      i++
    }
  }

  
  let done = false

  let current = allProjects[0]
  
  while (!done) {
    renderProjectList(
      terminal,
      allProjects,
      current
    )

    ;(await input({
      targets: [
        {
          key: Keys.Escape,
          call: () => {
            process.exit()
          }
        },
        {
          key: Keys.Enter,
          call: () => {
            done = true
          }
        },
        {
          key: Keys.Space,
          call: () => {
            current.selected = !current.selected
          }
        },
        {
          key: Keys.ArrowDown,
          call: () => {
            const next = allProjects[current.index + 1]
            if (next) {
              current = next
            } else {
              current = allProjects[0]
            }
          }
        },
        {
          key: Keys.ArrowUp,
          call: () => {
            const previous = allProjects[current.index - 1]
            if (previous) {
              current = previous
            } else {
              current = allProjects[allProjects.length - 1]
            }
          }
        },
        {
          key: '*',
          call: () => null
        }
      ]
    }))()
  }

  terminal.clearScreen()

  terminal.return()


  
  for (let project of allProjects) {
    if (project.selected) {
      terminal.clearScreen()
      terminal.return()
      spawn.sync(
        'vercel',
        [
          'remove',
          project.name
        ],
        {
          stdio: 'inherit'
        }
      )
    }
  }

  terminal.clearScreen()

  terminal.return()
  terminal.write("All done!")
})()

process.on("exit", () => {
  const terminal = new Terminal()

  terminal.showCursor()
  terminal.setRawMode(false)
  terminal.cursor.style.resetAll()
})