import React from 'react'
import dynamic from 'next/dynamic'

const DynamicSignInComponent = dynamic(() => import('../../components/Login'), {
  ssr: false,
})

export default function SignInPage() {
  return (
     <div>
        <React.Suspense fallback={<div>Loading...</div>}>
          <DynamicSignInComponent />
        </React.Suspense>
      </div>
  )
}