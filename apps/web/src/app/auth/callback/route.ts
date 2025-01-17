import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // If there's an error, redirect to signin with error message
  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(errorDescription || error)}`, 
      requestUrl.origin)
    )
  }

  // If no code is present, redirect to signin
  if (!code) {
    console.error('No code present in callback')
    return NextResponse.redirect(
      new URL('/auth/signin?error=No authorization code present', 
      requestUrl.origin)
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Exchange error:', exchangeError)
      throw exchangeError
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('Failed to exchange code for session:', error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Failed to complete authentication', 
      requestUrl.origin)
    )
  }
}
