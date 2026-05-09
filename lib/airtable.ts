export async function createAirtableRecord(data: Record<string, unknown>) {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME ?? 'Submissions')}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: data }),
    }
  )
  if (!response.ok) {
    throw new Error(`Airtable error: ${response.status}`)
  }
  return response.json()
}
