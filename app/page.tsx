'use client'

import dynamic from 'next/dynamic'

const FormFlow = dynamic(() => import('@/components/FormFlow'), { ssr: false })

export default function Home() {
  return <FormFlow />
}
