#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  💀 𝐀𝐒𝐊𝐑𝐘-𝐁𝐎𝐓 - 𝐇𝐀𝐂𝐊𝐄𝐑 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 💀                           ║
 * ║  WhatsApp Bot - Main Entry Point                              ║
 * ║  Author: Al Askry | Telegram: @askry47 | © 2026               ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 ASKRY BOT CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ASKRY_CONFIG = {
  name: "ASKRY-BOT",
  version: "2.0.0-HACKER",
  author: "Al Askry",
  telegram: "@askry47",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb6z6NO545v2nTgoBa3I",
  copyright: "© 2026 Al Askry. All Rights Reserved.",
  sessionFolder: "Askry_Session",
  colors: {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m'
  }
};

const { proto } = (await import('@whiskeysockets/baileys')).default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌍 GLOBAL HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

global.db = new Low(new JSONFile(`storage/databases/database.json`));
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1 * 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = lodash.chain(global.db.data);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH & CONNECTION SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
global.authFile = ASKRY_CONFIG.sessionFolder;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: 'client' });
logger.level = 'fatal';

const connectionOptions = {
  version: version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu(`Chrome - ${ASKRY_CONFIG.name}`),
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: {
    patch: false,
    snapshot: false,
  },
  getMessage: async (key) => {
    const jid = jidNormalizedUser(key.remoteJid);
    const msg = await store.loadMessage(jid, key.id);
    return msg?.message || '';
  },
};

global.conn = makeWASocket(connectionOptions);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤖 SUB-BOT RECONNECTION (JadiBots)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function reconnectSubBot(botPath) {
    console.log(chalk.yellow(`[🔄] Reconectando sub-bot: ${path.basename(botPath)}`));
    try {
        const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);
        const subBotConn = makeWASocket({
            version: version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: subBotState.creds,
                keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
            },
            browser: Browsers.ubuntu(`Chrome - ${ASKRY_CONFIG.name}`),
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            syncFullHistory: true,
            retryRequestDelayMs: 10,
            transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
            maxMsgRetryCount: 15,
            appStateMacVerification: { patch: false, snapshot: false },
            getMessage: async (key) => {
                const jid = jidNormalizedUser(key.remoteJid);
                const msg = await store.loadMessage(jid, key.id);
                return msg?.message || '';
            },
        });

        subBotConn.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(chalk.green(`[✅] Sub-bot conectado: ${path.basename(botPath)}`));
            } else if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.error(chalk.red(`[❌] Sub-bot desconectado: ${path.basename(botPath)} | Razón: ${reason}`));
                if (reason === 401) {
                    global.conns = global.conns.filter(conn => conn.user?.jid !== subBotConn.user?.jid);
                    console.log(chalk.red(`[🗑️] Sub-bot removido: ${subBotConn.user?.jid}`));
                }
            }
        });
        subBotConn.ev.on('creds.update', saveSubBotCreds);

        if (handler && handler.handler) {
            subBotConn.handler = handler.handler.bind(subBotConn);
            subBotConn.ev.on('messages.upsert', subBotConn.handler);
            console.log(chalk.blue(`[🔗] Handler asignado: ${path.basename(botPath)}`));
        }

        if (!global.subBots) global.subBots = {};
        global.subBots[path.basename(botPath)] = subBotConn;
        
        global.conns = global.conns || [];
        const yaExiste = global.conns.some(c => c.user?.jid === subBotConn.user?.jid);
        if (!yaExiste) {
            global.conns.push(subBotConn);
            console.log(chalk.green(`[🟢] Sub-bot agregado: ${subBotConn.user?.jid}`));
        }
    } catch (e) {
        console.error(chalk.red(`[💥] Error reconectando sub-bot ${path.basename(botPath)}:`), e);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 LOGIN HANDLER - HACKER STYLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function handleLogin() {
  if (conn.authState.creds.registered) {
    console.log(chalk.green('[✓] Sesión ya registrada.'));
    return;
  }

  // 💀 HACKER STYLE BANNER
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════╗
║  ${chalk.green('💀')} ${chalk.bold('ASKRY-BOT')} ${chalk.green('💀')}                          ║
║  ${chalk.yellow('Hacker Edition v' + ASKRY_CONFIG.version)}                     ║
║  ${chalk.magenta('Developer:')} ${chalk.white(ASKRY_CONFIG.author)}                    ║
║  ${chalk.magenta('Telegram:')} ${chalk.white(ASKRY_CONFIG.telegram)}                       ║
║  ${chalk.magenta('Copyright:')} ${chalk.white(ASKRY_CONFIG.copyright)}     ║
╚═══════════════════════════════════════════════╝
  `));

  let loginMethod = await question(
    chalk.green(`\n[?] Choose login method:\n${chalk.cyan('code')} (Pairing Code)  |  ${chalk.cyan('qr')} (QR Code)\n> `)
  );

  loginMethod = loginMethod.toLowerCase().trim();

  if (loginMethod === 'code') {
    let phoneNumber = await question(chalk.blue('[?] Enter your number (e.g., 201000000000):\n> '));
    phoneNumber = phoneNumber.replace(/\D/g, ''); 

    // Format phone number
    if (phoneNumber.startsWith('52') && phoneNumber.length === 12) {
      phoneNumber = `521${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.replace(/^0/, '');
    }

    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phoneNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.cyan('\n[🔐] Your pairing code:'), chalk.green.bold(code));
          console.log(chalk.yellow('[ℹ️] Scan this code in WhatsApp > Linked Devices > Link with Code'));
        } else {
          console.log(chalk.red('[❌] Connection not ready. Try again.'));
        }
      } catch (e) {
        console.log(chalk.red('[💥] Error requesting pairing code:'), e.message || e);
      }
    } else {
      console.log(chalk.red('[⚠️] Your Baileys version does not support code pairing.'));
    }
  } else {
    console.log(chalk.yellow('[📱] Generating QR code, scan with WhatsApp...'));
    conn.ev.on('connection.update', ({ qr }) => {
      if (qr) qrcode.generate(qr, { small: true });
    });
  }
}

await handleLogin();

conn.isInit = false;
conn.well = false;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 AUTO-CLEAR TMP & DATABASE SAVE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp']) {
        const tmp = [tmpdir(), 'tmp', 'serbot'];
        tmp.forEach((filename) => {
          spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
        });
      }
    }, 30 * 1000);
  }
}

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) return unlinkSync(file);
    return false;
  });
}

setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return;
  clearTmp();
}, 180000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📡 CONNECTION UPDATE HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;
  if (isNewLogin) conn.isInit = true;
  
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }
  
  if (global.db.data == null) await loadDatabase();
  
  if (connection === 'open') {
    console.log(chalk.yellow('[🟢] Connected successfully.'));
    
    // Show bot info
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════╗
║  ${chalk.green('💀')} ${chalk.bold(ASKRY_CONFIG.name)} ${chalk.green('💀')}                          ║
║  ${chalk.white('Status:')} ${chalk.green('ONLINE')}                              ║
║  ${chalk.white('User:')} ${chalk.green(conn.user?.name || 'N/A')}                     ║
║  ${chalk.white('JID:')} ${chalk.green(conn.user?.jid || 'N/A')}                       ║
║  ${chalk.white('Channel:')} ${chalk.magenta(ASKRY_CONFIG.whatsappChannel)}  ║
╚═══════════════════════════════════════════════╝
    `));

    // ─── Sub-bots reconnection logic ───
    const rutaJadiBot = join(__dirname, './JadiBots');
    
    if (!existsSync(rutaJadiBot)) {
        mkdirSync(rutaJadiBot, { recursive: true });
        console.log(chalk.bold.cyan(`[📁] Folder created: ${rutaJadiBot}`));
    }

    const readRutaJadiBot = readdirSync(rutaJadiBot);
    if (readRutaJadiBot.length > 0) {
        const credsFile = 'creds.json';
        for (const subBotDir of readRutaJadiBot) {
            const botPath = join(rutaJadiBot, subBotDir);
            const readBotPath = readdirSync(botPath);
            if (readBotPath.includes(credsFile)) {
                await reconnectSubBot(botPath);
            }
        }
    }
  }
  
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  
  if (reason === 405) {
    if (existsSync('./songsessions/creds.json')) unlinkSync('./songsessions/creds.json');
    console.log(chalk.bold.redBright(`[🔄] Connection replaced. Restarting...\nIf errors appear, run: npm start`));
    process.send('reset');
  }
  
  if (connection === 'close') {
    switch (reason) {
      case DisconnectReason.badSession:
        conn.logger.error(`[❌] Bad session. Delete folder ${global.authFile} and scan again.`);
        break;
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
        conn.logger.warn(`[⚠️] Connection lost. Reconnecting...`);
        await global.reloadHandler(true).catch(console.error);
        break;
      case DisconnectReason.connectionReplaced:
        conn.logger.error(`[🔄] Connection replaced. Close other session first.`);
        break;
      case DisconnectReason.loggedOut:
        conn.logger.error(`[🔓] Logged out. Delete ${global.authFile} and scan again.`);
        break;
      case DisconnectReason.restartRequired:
        conn.logger.info(`[🔄] Restart required.`);
        await global.reloadHandler(true).catch(console.error);
        break;
      default:
        conn.logger.warn(`[❓] Unknown disconnect: ${reason || ''} | State: ${connection || ''}`);
        await global.reloadHandler(true).catch(console.error);
        break;
    }
  }
}

process.on('uncaughtException', console.error);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 HANDLER & PLUGIN SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Handler && Object.keys(Handler).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }

  if (restartConn) {
    try { if (global.conn.ws) global.conn.ws.close(); } catch {}
    global.conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions);
    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  isInit = false;
  return true;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PLUGIN LOADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
await filesInit();

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`[🔄] Updated plugin: '${filename}'`);
      else {
        conn.logger.warn(`[🗑️] Deleted plugin: '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`[✨] New plugin: '${filename}'`);

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`[💥] Syntax error in '${filename}':\n${format(err)}`);
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`[💥] Error loading '${filename}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);

watch(pluginFolder, global.reload);
await global.reloadHandler();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 END OF ASKRY-BOT INDEX.JS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━