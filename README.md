#### 💀 𝐀𝐒𝐊𝐑𝐘 𝐁𝐎𝐓 - 𝐇𝐀𝐂𝐊𝐄𝐑 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 💀 ####
# ═══════════════════════════════════════════════════ #
#  🛡️  WhatsApp Bot - Al Askry Official  🛡️          #
# ═══════════════════════════════════════════════════ #

# 👑 DEVELOPER INFORMATION
DEVELOPER_NAME = "Al Askry"
DEVELOPER_TELEGRAM = "@askry47"
DEVELOPER_YEAR = "2026"
COPYRIGHT = f"© {DEVELOPER_YEAR} {DEVELOPER_NAME}. All Rights Reserved."

# 🤖 BOT CONFIGURATION
BOT_NAME = "💀 ASKRY BOT 💀"
BOT_VERSION = "v2.0.0-HACKER"
BOT_PREFIX = "."  # Command prefix
BOT_MODE = "private"  # private/public

# 📡 SOCIAL LINKS
SOCIAL_LINKS = {
    'telegram': 'https://t.me/askry47',
    'channel': 'https://t.me/askry47',
    'support': 'https://t.me/askry47',
    'github': 'https://github.com/askry47'  # Optional
}

# 🎨 HACKER THEME COLORS (For Console Output)
class Colors:
    CYAN = '\033[1;96m'
    GREEN = '\033[1;92m'
    YELLOW = '\033[1;93m'
    RED = '\033[1;91m'
    MAGENTA = '\033[1;95m'
    BLUE = '\033[1;94m'
    WHITE = '\033[1;97m'
    BLACK = '\033[1;90m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# 💀 HACKER ASCII BANNER
HACKER_BANNER = f"""
{Colors.GREEN}
╔═══════════════════════════════════════════════════╗
║  {Colors.CYAN}██╗{Colors.GREEN}   {Colors.CYAN}██╗{Colors.GREEN} {Colors.CYAN}███████╗{Colors.GREEN} {Colors.CYAN}████████╗{Colors.GREEN} {Colors.CYAN}██╗  ██╗{Colors.GREEN}      ║
║  {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}██║{Colors.GREEN} {Colors.CYAN}██╔════╝{Colors.GREEN} {Colors.CYAN}╚══██╔══╝{Colors.GREEN} {Colors.CYAN}██║  ██║{Colors.GREEN}      ║
║  {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}██║{Colors.GREEN} {Colors.CYAN}███████╗{Colors.GREEN}    {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}███████║{Colors.GREEN}      ║
║  {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}██║{Colors.GREEN} {Colors.CYAN}╚════██║{Colors.GREEN}    {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}██╔══██║{Colors.GREEN}      ║
║  {Colors.CYAN}╚██████╔╝{Colors.GREEN} {Colors.CYAN}███████║{Colors.GREEN}    {Colors.CYAN}██║{Colors.GREEN}   {Colors.CYAN}██║  ██║{Colors.GREEN}      ║
║  {Colors.CYAN} ╚═════╝ {Colors.GREEN}  {Colors.CYAN}╚══════╝{Colors.GREEN}    {Colors.CYAN}╚═╝{Colors.GREEN}   {Colors.CYAN}╚═╝  ╚═╝{Colors.GREEN}      ║
║                                                   ║
║     {Colors.YELLOW}[💀] {Colors.WHITE}ASKRY BOT - HACKER EDITION{Colors.YELLOW} [💀]{Colors.GREEN}      ║
║                                                   ║
║  {Colors.MAGENTA}═══════════════════════════════════════════{Colors.GREEN}  ║
║  {Colors.WHITE}Developer : {Colors.CYAN}{DEVELOPER_NAME}{Colors.GREEN}                        {Colors.GREEN}  ║
║  {Colors.WHITE}Telegram  : {Colors.CYAN}{DEVELOPER_TELEGRAM}{Colors.GREEN}                       {Colors.GREEN}  ║
║  {Colors.WHITE}Copyright : {Colors.CYAN}{COPYRIGHT}{Colors.GREEN}          {Colors.GREEN}  ║
║  {Colors.MAGENTA}═══════════════════════════════════════════{Colors.GREEN}  ║
╚═══════════════════════════════════════════════════╝
{Colors.RESET}
"""

# 🔧 SYSTEM SETTINGS
SETTINGS = {
    'auto_read': True,
    'auto_reply': False,
    'anti_delete': True,
    'anti_link': False,
    'welcome_msg': True,
    'log_channel': None,  # Set your log channel ID here
}

# 🛡️ SECURITY SETTINGS
SECURITY = {
    'owner_only_commands': True,
    'block_unknown_users': False,
    'max_messages_per_minute': 20,
    'allowed_groups': [],  # Add group IDs here
}

# 📦 DATABASE SETTINGS
DATABASE = {
    'type': 'json',  # json/mongodb/sqlite
    'path': './data/',  # For JSON/SQLite
    'mongodb_uri': '',  # For MongoDB (optional)
}

# 🌐 API SETTINGS (If bot uses external APIs)
API_KEYS = {
    'openai': '',  # Optional
    'weather': '',  # Optional
    'other': '',  # Optional
}

# 🎮 GAMING FEATURES (PUBG + Free Fire)
GAMING = {
    'pubg_lookup': True,
    'freefire_lookup': True,
    'game_commands': ['.pubg', '.ff', '.stats'],
}

# 📝 LOGGING SETTINGS
LOGGING = {
    'level': 'INFO',  # DEBUG/INFO/ERROR
    'file': 'askry_bot.log',
    'console': True,
}

# ═══════════════════════════════════════════════════ #
#  💀 END OF CONFIG - ASKRY BOT © 2026 💀            #
# ═══════════════════════════════════════════════════ #