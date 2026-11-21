import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

export type AccordionItem = { id: string; title: string; content: ReactNode }

export function Accordion({
  items,
  contentClassName = 'text-cream-muted',
}: {
  items: AccordionItem[]
  contentClassName?: string
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)
  const reduce = useReducedMotion()

  return (
    <ul className="divide-y divide-cream-muted/20 border-t border-b border-cream-muted/20">
      {items.map((item) => {
        const open = openId === item.id
        return (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-semibold"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              {item.title}
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.25 }}
              >
                <ChevronDown className="size-5" aria-hidden />
              </motion.span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`pb-5 text-base leading-relaxed ${contentClassName}`}>{item.content}</div>
            </motion.div>
          </li>
        )
      })}
    </ul>
  )
}