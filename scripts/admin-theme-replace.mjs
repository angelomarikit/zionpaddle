import fs from 'node:fs'
import path from 'node:path'

const root = path.join(import.meta.dirname, '..', 'src')

const map = [
  ['bg-[#f6f6f7]', 'bg-admin-canvas'],
  ['bg-[#f1f1f1]', 'bg-admin-sidebar'],
  ['bg-[#fafafa]', 'bg-admin-subtle'],
  ['bg-[#fffdfa]', 'bg-admin-highlight'],
  ['bg-[#fff8f6]', 'bg-red-50'],
  ['border-[#f1f1f1]', 'border-platinum-200'],
  ['border-[#e3e3e3]', 'border-admin-border'],
  ['divide-[#f1f1f1]', 'divide-platinum-200'],
  ['divide-[#e3e3e3]', 'divide-admin-border'],
  ['text-[#303030]', 'text-admin-ink'],
  ['text-[#616161]', 'text-admin-muted'],
  ['text-[#4a4a4a]', 'text-admin-muted'],
  ['text-[#005bd3]', 'text-admin-link'],
  ['text-[#181818]', 'text-admin-ink'],
  ['text-[#9e9e9e]', 'text-admin-chrome'],
  ['text-[#bdbdbd]', 'text-admin-chrome'],
  ['border-[#c9cccf]', 'border-admin-input'],
  ['border-[#303030]/20', 'border-admin-ink/20'],
  ['ring-[#303030]/5', 'ring-admin-ink/5'],
  ['border-[#303030]', 'border-admin-ink'],
  ['bg-[#e3e3e3]', 'bg-gold-400/35'],
  ['bg-[#303030]', 'bg-admin-gold'],
  ['hover:bg-[#1a1a1a]', 'hover:bg-admin-gold-dark'],
  ['hover:bg-[#f6f6f7]', 'hover:bg-admin-canvas'],
  ['hover:bg-[#f1f1f1]', 'hover:bg-admin-sidebar'],
  ['focus:border-[#005bd3]', 'focus:border-admin-gold'],
  ['focus:ring-[#005bd3]/25', 'focus:ring-admin-gold/25'],
  ['bg-[#1a7f5a]', 'bg-admin-success'],
  ['hover:bg-[#146b4a]', 'hover:bg-admin-success/90'],
  ['border-[#1a7f5a]', 'border-admin-success'],
  ['bg-[#e3f1df]', 'bg-admin-success-bg'],
  ['text-[#1a7f5a]', 'text-admin-success'],
  ['hover:bg-[#d4ead0]', 'hover:bg-admin-success-bg'],
  ['bg-[#2874c4]', 'bg-admin-gold'],
  ['border-[#95c4ee]', 'border-admin-gold-light'],
  ['text-[#2874c4]', 'text-admin-gold'],
  ['fill-[#2874c4]', 'fill-admin-gold'],
  ['stroke-[#2874c4]', 'stroke-admin-gold'],
]

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      let text = fs.readFileSync(p, 'utf8')
      const before = text
      for (const [from, to] of map) {
        text = text.split(from).join(to)
      }
      if (text !== before) fs.writeFileSync(p, text)
    }
  }
}

walk(root)
console.log('admin theme class replacement done')