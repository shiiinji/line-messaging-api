'use client'
import React from 'react'
import { Suspense } from 'react'
import { LineCallbackPageContent } from '@/app/line/callback/_components'

export default function LineCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LineCallbackPageContent />
    </Suspense>
  )
}
