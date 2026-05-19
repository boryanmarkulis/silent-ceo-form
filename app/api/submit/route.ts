import { NextRequest, NextResponse } from 'next/server'
import { FormSchema } from '@/lib/schema'
import { createAirtableRecord } from '@/lib/airtable'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = FormSchema.parse({ ...body, submitted_at: new Date().toISOString() })

    await createAirtableRecord({
      'Company':           data.company,
      'Website':           data.website ?? '',
      'Role':              data.role,
      'Headcount':         data.headcount,
      'Revenue':           data.revenue,
      'Tools: Accounting': JSON.stringify(data.tools_accounting),
      'Tools: CRM':        JSON.stringify(data.tools_crm),
      'Tools: PM':         JSON.stringify(data.tools_pm),
      'Tools: Comms':      JSON.stringify(data.tools_comms),
      'Tools: HR':         JSON.stringify(data.tools_hr),
      'Numbers (where)':   data.numbers_where,
      'Blind spots':       JSON.stringify(data.blind_spots),
      'AI COO: first':     data.ai_coo_first,
      'Pricing':           data.pricing,
      'AI Tools':          data.ai_tools ? JSON.stringify(data.ai_tools) : '',
      'Coach':             data.coach ?? '',
      'Name':              data.name ?? '',
      'Email':             data.email ?? '',
      'Ref':               data.ref ?? '',
      'Submitted at':      data.submitted_at ?? '',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'Submission failed' }, { status: 500 })
  }
}
