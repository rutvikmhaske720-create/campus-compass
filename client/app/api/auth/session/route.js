import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '../[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session || { user: null })
  } catch (error) {
    return NextResponse.json({ user: null, error: error.message }, { status: 200 })
  }
}