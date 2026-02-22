#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  💀 𝐀𝐒𝐊𝐑𝐘-𝐁𝐎𝐓 𝐋𝐀𝐔𝐍𝐂𝐇𝐄𝐑 - 𝐇𝐀𝐂𝐊𝐄𝐑 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 💀                  ║
 * ║  Cluster Manager with Auto-Restart & Hacker Theme             ║
 * ║  Author: Al Askry | Telegram: @askry47 | © 2026               ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 ASKRY BOT CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ASKRY_INFO = {
  name: "ASKRY-BOT",
  version: "2.0.0-HACKER",
  author: "Al Askry",
  telegram: "@askry47",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb6z6NO545v2nTgoBa3I",
  copyright: "© 2026 Al Askry. All Rights Reserved.",
  mainFile: "index.js"  // الملف الرئيسي اللي هيتشغل
};

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 HACKER STYLE BANNER WITH CFONTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log(chalk.cyan('\n' + '═'.repeat(50)))

cfonts.say('ASKRY\nBOT', {
  font: 'block',
  align: 'center',
  gradient: ['cyan', 'green', 'yellow'],
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: '0'
})

cfonts.say(`V${ASKRY_INFO.version}`, {
  font: 'simple',
  align: 'center',
  gradient: ['green', 'cyan']
})

console.log(chalk.magenta(`\n   👤 Developer : ${chalk.white(ASKRY_INFO.author)}`))
console.log(chalk.magenta(`   📡 Telegram  : ${chalk.white(ASKRY_INFO.telegram)}`))
console.log(chalk.magenta(`   💬 WhatsApp  : ${chalk.white(ASKRY_INFO.whatsappChannel)}`))
console.log(chalk.magenta(`   🔐 Copyright : ${chalk.white(ASKRY_INFO.copyright)}`))
console.log(chalk.cyan('═'.repeat(50) + '\n'))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 CLUSTER MANAGER WITH AUTO-RESTART
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let isWorking = false
let restartCount = 0
const MAX_RESTARTS = 5
const restartCooldown = 10000 // 10 seconds between restarts
let lastRestartTime = 0

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    let child = fork()
    
    const startTime = Date.now()
    console.log(chalk.green(`[🚀] Starting ${ASKRY_INFO.name}...`))
    console.log(chalk.cyan(`[📁] Main file: ${script}`))
    console.log(chalk.cyan(`[🔗] PID: ${child.pid}\n`))

    child.on('message', (msg) => {
      if (msg === 'reset') {
        console.log(chalk.yellow('[🔄] Reset requested by bot...'))
        child.kill()
      }
    })

    child.on('exit', (code, signal) => {
      const uptime = Math.floor((Date.now() - startTime) / 1000)
      
      if (code === 0) {
        console.log(chalk.green(`[✅] ${ASKRY_INFO.name} exited cleanly (uptime: ${uptime}s)`))
        isWorking = false
        return
      }
      
      if (signal) {
        console.log(chalk.red(`[💥] ${ASKRY_INFO.name} killed by signal: ${signal}`))
      } else {
        console.log(chalk.red(`[❌] ${ASKRY_INFO.name} crashed with code: ${code} (uptime: ${uptime}s)`))
      }

      // Anti-crash loop protection
      const now = Date.now()
      if (now - lastRestartTime < restartCooldown) {
        restartCount++
        if (restartCount >= MAX_RESTARTS) {
          console.log(chalk.red.bold(`\n[🚨] Too many restarts (${MAX_RESTARTS}) in short time!`))
          console.log(chalk.red(`[⏸️] Waiting 60 seconds before next attempt...\n`))
          setTimeout(() => {
            restartCount = 0
            lastRestartTime = 0
            isWorking = false
            launch(scripts)
          }, 60000)
          return
        }
      } else {
        restartCount = 0
      }
      
      lastRestartTime = now
      isWorking = false
      
      console.log(chalk.yellow(`[🔄] Auto-restarting in 3 seconds... (attempt ${restartCount + 1}/${MAX_RESTARTS})\n`))
      
      setTimeout(() => {
        launch(scripts)
      }, 3000)

      // Watch for file changes to trigger restart
      watchFile(args[0], (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          console.log(chalk.cyan(`[📝] File changed: ${script} - Reloading...`))
          unwatchFile(args[0])
          if (child) child.kill()
          launch(scripts)
        }
      })
    })

    child.on('error', (err) => {
      console.log(chalk.red(`[💥] Error in ${ASKRY_INFO.name}: ${err.message}`))
    })
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 START THE BOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log(chalk.cyan(`[ℹ️] Launching ${ASKRY_INFO.name} v${ASKRY_INFO.version}...\n`))

launch([ASKRY_INFO.mainFile])

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ GLOBAL ERROR HANDLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
process.on('uncaughtException', (err) => {
  console.log(chalk.red(`[💥] Uncaught Exception: ${err.message}`))
  console.log(err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log(chalk.red(`[💥] Unhandled Rejection at: ${promise}`))
  console.log(chalk.red(`Reason: ${reason}`))
})

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n[👋] Received SIGINT - Shutting down gracefully...'))
  process.exit(0)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 END OF ASKRY-BOT LAUNCHER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━