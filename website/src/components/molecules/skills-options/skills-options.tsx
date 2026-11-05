'use client'

import clsx from 'clsx'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '../../atoms/button/button'
import { Paragraph } from '../../atoms/paragraph/paragraph'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'

type SkillsTab = {
  id: string
  name: string
  display: string
  copy: string
}

const allTabs: SkillsTab[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    display: '/plugin marketplace add spiceai/skills\n/plugin install spiceai@spiceai',
    copy: '/plugin marketplace add spiceai/skills\n/plugin install spiceai@spiceai'
  },
  {
    id: 'codex',
    name: 'Codex',
    display: 'codex plugin marketplace add spiceai/skills\ncodex plugin add spiceai@spiceai',
    copy: 'codex plugin marketplace add spiceai/skills\ncodex plugin add spiceai@spiceai'
  },
  {
    id: 'other-agents',
    name: 'Other agents',
    display: 'npx skills add spiceai/skills',
    copy: 'npx skills add spiceai/skills'
  },
  {
    id: 'agent-prompt',
    name: 'Agent prompt',
    display:
      '# Paste this prompt into your coding agent\n\nInstall the Spice.ai skills from github.com/spiceai/skills, using one method:\n- Claude Code: `claude plugin marketplace add spiceai/skills`, then `claude plugin install spiceai@spiceai`\n- Codex: `codex plugin marketplace add spiceai/skills`, then `codex plugin add spiceai@spiceai`\n- Other agents: `npx skills add spiceai/skills -a <agent-id>`\nThen follow the setup skill (skills/setup/SKILL.md) to run Spice in this project and show me a SQL query result.',
    copy: 'Install the Spice.ai skills from github.com/spiceai/skills, using one method:\n- Claude Code: `claude plugin marketplace add spiceai/skills`, then `claude plugin install spiceai@spiceai`\n- Codex: `codex plugin marketplace add spiceai/skills`, then `codex plugin add spiceai@spiceai`\n- Other agents: `npx skills add spiceai/skills -a <agent-id>`\nThen follow the setup skill (skills/setup/SKILL.md) to run Spice in this project and show me a SQL query result.'
  }
]

export const SkillsOptions = () => {
  const tabsRef = useRef<(HTMLElement | null)[]>([])
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0)
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0)
  const [copied, setCopied] = useState(false)
  const snippetId = useId()

  useEffect(() => {
    const setTabPosition = () => {
      const currentTab = tabsRef.current[activeTabIndex] as HTMLElement
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 8)
      setTabUnderlineWidth(currentTab?.clientWidth ?? 126)
    }

    setTabPosition()
    window.addEventListener('resize', setTabPosition)

    return () => window.removeEventListener('resize', setTabPosition)
  }, [activeTabIndex])

  const activeTab = allTabs[activeTabIndex]

  return (
    <div className='pt-14'>
      <div className='relative mx-auto grid grid-cols-2 gap-2 px-2 backdrop-blur-xs sm:grid-cols-4 md:flex md:h-12'>
        <span
          className={clsx(
            'absolute bottom-0 top-0 -z-10 hidden rounded-lg bg-alpha-100 px-4 py-3 transition-all duration-300 md:block',
            tabUnderlineLeft === 0 ? 'opacity-0' : 'opacity-100'
          )}
          style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
        />
        {allTabs.map((tab, index) => {
          const isActive = activeTabIndex === index

          return (
            <Button
              key={tab.id}
              variant='tag'
              ref={(el) => {
                tabsRef.current[index] = el
              }}
              className={clsx(
                'relative flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:active:bg-alpha-50',
                isActive && 'bg-alpha-100 md:bg-transparent md:hover:bg-transparent'
              )}
              onClick={() => {
                setActiveTabIndex(index)
                setCopied(false)
              }}
              aria-pressed={isActive}
              aria-label={`Go to ${tab.name} tab`}
            >
              <span>{tab.name}</span>
            </Button>
          )
        })}
      </div>

      <button
        onClick={() => {
          navigator.clipboard
            .writeText(activeTab.copy)
            .then(() => {
              setCopied(true)
              setTimeout(() => {
                setCopied(false)
              }, 2300)
            })
            .catch(() => {})
        }}
        aria-label={`Copy the ${activeTab.name} snippet to the clipboard`}
        aria-describedby={snippetId}
        className='group relative mt-6 w-full rounded-lg border border-alpha-150 bg-neutral p-4 shadow-box transition-shadow hover:shadow-code md:w-11/12 md:p-10'
      >
        <div className='flex items-start gap-4 overflow-x-auto text-left'>
          <code id={snippetId} className='whitespace-pre-wrap break-words bg-transparent text-base md:w-11/12 md:text-lg'>
            {activeTab.display}
          </code>

          <div className='absolute right-3 top-2 md:right-7 md:top-10'>
            <ClipboardDocumentIcon className='h-6 w-6 transition-colors group-hover:text-primary' />
          </div>
        </div>

        <div
          aria-hidden={true}
          className={clsx(
            'absolute -bottom-7 right-0 flex items-center gap-1 font-semibold opacity-0 transition-opacity md:bottom-5 md:right-3 md:translate-y-1/2',
            copied && 'opacity-100'
          )}
        >
          <CheckCircleIcon className='h-6 w-6 text-primary' />
          <Paragraph>Copied!</Paragraph>
        </div>
      </button>

      <span className='sr-only' role='status' aria-live='polite'>
        {copied ? 'Copied!' : ''}
      </span>
    </div>
  )
}
