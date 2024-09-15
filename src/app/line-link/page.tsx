'use client'
import React from 'react'
import { Suspense } from 'react'
import { LinkPageContent } from '@/app/line-link/_components'

export default function LinkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinkPageContent />
    </Suspense>
  )
}
