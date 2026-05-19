import { NextRequest, NextResponse } from 'next/server'
import { PartialFormSchema, type PartialFormData } from '@/lib/schema'
import { createAirtableRecord, updateAirtableRecord } from '@/lib/airtable'

function stringifyList(value: string[] | undefined) {
  return value ? JSON.stringify(value) : ''
}

function toAirtableFields(data: PartialFormData) {
  return {
    'Company':           data.company ?? '',
    'Website':           data.website ?? '',
    'Role':              data.role ?? '',
    'Headcount':         data.headcount ?? '',
    'Revenue':           data.revenue ?? '',
    'Tools: Accounting': stringifyList(data.tools_accounting),
    'Tools: CRM':        stringifyList(data.tools_crm),
    'Tools: PM':         stringifyList(data.tools_pm),
    'Tools: Comms':      stringifyList(data.tools_comms),
    'Tools: HR':         stringifyList(data.tools_hr),
    'Numbers (where)':   data.numbers_where ?? '',
    'Blind spots':       stringifyList(data.blind_spots),
    'AI COO: first':     data.ai_coo_first ?? '',
    'Pricing':           data.pricing ?? '',
    'AI Tools':          stringifyList(data.ai_tools),
    'Coach':             data.coach ?? '',
    'Name':              data.name ?? '',
    'Email':             data.email ?? '',
    'Ref':               data.ref ?? '',
    'Submitted at':      data.submitted_at ?? '',
    'Session ID':        data.session_id,
    'Claimed':           data.claimed ?? false,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = PartialFormSchema.parse({
      ...body,
      submitted_at: body.submitted_at ?? new Date().toISOString(),
    })

    const record = await createAirtableRecord(toAirtableFields(data))

    return NextResponse.json({ ok: true, record_id: record.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'Save failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const data = PartialFormSchema.parse({
      ...body,
      submitted_at: body.submitted_at ?? new Date().toISOString(),
    })

    if (!data.record_id) {
      return NextResponse.json({ ok: false, error: 'Missing record_id' }, { status: 400 })
    }

    await updateAirtableRecord(data.record_id, toAirtableFields(data))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'Save failed' }, { status: 500 })
  }
}
