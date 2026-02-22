#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  💀 𝐀𝐒𝐊𝐑𝐘-𝐁𝐎𝐓 𝐇𝐀𝐍𝐃𝐋𝐄𝐑 - 𝐇𝐀𝐂𝐊𝐄𝐑 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 💀                  ║
 * ║  Main Message Handler - Processes all commands & events       ║
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
  emoji: {
    owner: '👑',
    admin: '🛡️',
    premium: '💎',
    error: '💥',
    success: '✅',
    warning: '⚠️'
  }
};

import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const log = {
  info: (msg) => console.log(chalk.cyan(`[ℹ️] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[✅] ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`[⚠️] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[💥] ${msg}`)),
  hacker: (msg) => console.log(chalk.magenta(`[🔐] ${msg}`))
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 MAIN HANDLER FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.limit = false

        try {
            // ─── User Data Initialization ───
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            user = global.db.data.users[m.sender]

            if (!isNumber(user.exp)) user.exp = 0
            if (!isNumber(user.limit)) user.limit = 10
            if (!('premium' in user)) user.premium = false
            if (!user.premium) user.premiumTime = 0
            if (!('registered' in user)) user.registered = false

            if (!user.registered) {
                if (!('name' in user)) user.name = m.name
                if (!isNumber(user.age)) user.age = -1
                if (!isNumber(user.regTime)) user.regTime = -1
            }

            if (!isNumber(user.afk)) user.afk = -1
            if (!('afkReason' in user)) user.afkReason = ''
            if (!('banned' in user)) user.banned = false
            if (!('useDocument' in user)) user.useDocument = false
            if (!isNumber(user.level)) user.level = 0
            if (!isNumber(user.bank)) user.bank = 0

            // ─── Chat Data Initialization ───
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
            chat = global.db.data.chats[m.chat]

            if (!('isBanned' in chat)) chat.isBanned = false
            if (!('bienvenida' in chat)) chat.bienvenida = true 
            if (!('antiLink' in chat)) chat.antiLink = false
            if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
            if (!('nsfw' in chat)) chat.nsfw = false
            if (!isNumber(chat.expired)) chat.expired = 0

            // ─── Settings Initialization ───
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            settings = global.db.data.settings[this.user.jid]

            if (!('self' in settings)) settings.self = false
            if (!('autoread' in settings)) settings.autoread = false
            
        } catch (e) {
            log.error(`Database init error: ${e.message}`)
        }

        // ─── Global Options Check ───
        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

        // ─── Permission Levels ───
        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.premium == true

        // ─── Queue System ───
        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix
        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false

        // ─── Plugin Loader ───
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            if (plugin.disabled) continue

            const __filename = join(___dirname, name)

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    log.error(`Plugin.all error in ${name}: ${e.message}`)
                }
            }

            if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix

            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, user, bot,
                    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue

            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ?
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ?
                            plugin.command === command :
                            false

                if (!isAccept) continue

                m.plugin = name

                // ─── Ban Checks ───
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    let setting = global.db.data.settings[this.user.jid]
                    if (name != 'group-unbanchat.js' && chat?.isBanned) return
                    if (name != 'owner-unbanuser.js' && user?.banned) return
                    if (name != 'owner-unbanbot.js' && setting?.banned) return
                }

                // ─── Permission Checks ───
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) {
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) {
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) {
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) {
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) {
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) {
                    fail('unreg', m, this)
                    continue
                }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) m.reply('chirrido -_-')
                else m.exp += xp

                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    conn.reply(m.chat, `⚠️ *${ASKRY_INFO.name}*: Se agotaron tus límites`, m)
                    continue
                }

                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
                    participants, groupMetadata, user, bot,
                    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename
                }

                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    m.error = e
                    log.error(`Plugin error in ${name}: ${e.message}`)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(`${ASKRY_INFO.emoji.error} *Error*: ${text.slice(0, 200)}`)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            log.error(`Plugin.after error: ${e.message}`)
                        }
                    }
                    if (m.limit) conn.reply(m.chat, `💎 Utilizaste *${+m.limit}* límites`, m)
                }

                break
            }
        }
    } catch (e) {
        log.error(`Handler error: ${e.message}`)
    } finally {
        // ─── Queue Cleanup ───
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }

        // ─── Stats & XP Update ───
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }

            if (m.plugin) {
                let now = +new Date()
                let stat = stats[m.plugin] || { total: 0, success: 0, last: 0, lastSuccess: 0 }
                stat.total = (stat.total || 0) + 1
                stat.last = now
                if (m.error == null) {
                    stat.success = (stat.success || 0) + 1
                    stat.lastSuccess = now
                }
                stats[m.plugin] = stat
            }
        }

        // ─── Print Message (Debug) ───
        try {
            if (!opts['noprint']) {
                const print = await import(`./lib/print.js`)
                await print.default(m, this)
            }
        } catch (e) {
            console.log(m, m.quoted, e)
        }

        // ─── Auto-Read ───
        const settingsREAD = global.db.data.settings[this.user.jid] || {}
        if (opts['autoread']) await this.readMessages([m.key])
        if (settingsREAD.autoread) await this.readMessages([m.key])
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 HACKER STYLE ERROR MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
global.dfail = (type, m, conn, usedPrefix) => {
    const emojis = ASKRY_INFO.emoji
    
    const mensajes = {
        rowner: `${emojis.owner} *${ASKRY_INFO.name}*\n\n> 🔐 *هذا الأمر خاص بالمطور فقط*\n\n> 👤 ${ASKRY_INFO.author}\n> 📡 ${ASKRY_INFO.telegram}`,
        
        owner: `${emojis.owner} *${ASKRY_INFO.name}*\n\n> 🔐 *هذا الأمر خاص بالمطور*\n\n> 👤 ${ASKRY_INFO.author}\n> 📡 ${ASKRY_INFO.telegram}`,
        
        mods: `${emojis.admin} *${ASKRY_INFO.name}*\n\n> 🛡️ *هذه الميزة للمشرفين فقط*\n\n> 👤 ${ASKRY_INFO.author}\n> 📡 ${ASKRY_INFO.telegram}`,
        
        premium: `${emojis.premium} *${ASKRY_INFO.name}*\n\n> 💎 *هذا الأمر للمستخدمين المميزين فقط*\n\n> 📡 اشترك: ${ASKRY_INFO.telegram}`,
        
        group: `${emojis.warning} *${ASKRY_INFO.name}*\n\n> 👥 *هذا الأمر يعمل فقط في المجموعات*\n\n> 💬 قناتنا: ${ASKRY_INFO.whatsappChannel}`,
        
        private: `${emojis.warning} *${ASKRY_INFO.name}*\n\n> 🔒 *هذا الأمر يعمل فقط في المحادثة الخاصة*\n\n> 💬 قناتنا: ${ASKRY_INFO.whatsappChannel}`,
        
        admin: `${emojis.admin} *${ASKRY_INFO.name}*\n\n> 🛡️ *هذا الأمر مخصص فقط للمشرفين*\n\n> 💬 قناتنا: ${ASKRY_INFO.whatsappChannel}`,
        
        botAdmin: `${emojis.warning} *${ASKRY_INFO.name}*\n\n> ⚙️ *اجعلني مشرفاً أولاً لاستخدام هذا الأمر*\n\n> 💬 قناتنا: ${ASKRY_INFO.whatsappChannel}`,
        
        unreg: `${emojis.warning} *${ASKRY_INFO.name}*\n\n> 📝 *يجب التسجيل أولاً*\n\n> *مثال:* ${usedPrefix}تسجيل اسمك.عمرك\n> *مثال:* ${usedPrefix}register Ahmed.20\n\n> 💬 مساعدة: ${ASKRY_INFO.telegram}`,
        
        restrict: `${emojis.error} *${ASKRY_INFO.name}*\n\n> 🚫 *تم تعطيل هذا الأمر بواسطة المطور*\n\n> 👤 ${ASKRY_INFO.author}\n> 📅 ${ASKRY_INFO.copyright}`
    }

    const msg = mensajes[type]
    if (msg) {
        return conn.reply(m.chat, msg, m).then(() => {
            if (m.react) m.react('⚡')
        })
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 AUTO-RELOAD ON FILE CHANGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const file = fileURLToPath(import.meta.url)
watchFile(file, async () => {
    unwatchFile(file)
    log.hacker(`🔄 تم تحديث '${path.basename(file)}' - إعادة تحميل...`)
    if (global.reloadHandler) {
        const result = await global.reloadHandler()
        if (result) log.success('✅ تم إعادة تحميل handler.js بنجاح')
        else log.error('❌ فشل في إعادة التحميل')
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 END OF ASKRY-BOT HANDLER.JS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━