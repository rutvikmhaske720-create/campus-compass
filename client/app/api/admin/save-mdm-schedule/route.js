import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { filename, fileData } = await request.json()
    
    if (!fileData) {
      return NextResponse.json({ success: false, error: 'No file data provided' })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const timestamp = Math.round(new Date().getTime() / 1000)
    const publicId = `mdm-schedules/mdm_schedule_${Date.now()}`
    
    const signature = require('crypto')
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const formData = new FormData()
    formData.append('file', `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${fileData}`)
    formData.append('public_id', publicId)
    formData.append('timestamp', timestamp)
    formData.append('api_key', apiKey)
    formData.append('signature', signature)
    formData.append('resource_type', 'raw')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || 'Upload failed')
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Error saving schedule:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
