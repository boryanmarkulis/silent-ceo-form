import { z } from 'zod'

const toolsField = z.array(z.string()).min(1, 'Pick at least one option')

export const FormSchema = z.object({
  company:          z.string().min(1),
  website:          z.string().optional(),
  role:             z.string().min(1),
  headcount:        z.string().min(1),
  revenue:          z.string().min(1),
  tools_accounting: toolsField,
  tools_crm:        toolsField,
  tools_pm:         toolsField,
  tools_comms:      toolsField,
  tools_hr:         toolsField,
  numbers_where:    z.string().min(1),
  blind_spots:      z.array(z.string()).min(1),
  ai_coo_first:     z.string().min(1),
  pricing:          z.string().min(1),
  name:             z.string().optional(),
  email:            z.union([z.string().email(), z.literal('')]).optional(),
  ref:              z.string().optional(),
  submitted_at:     z.string().optional(),
})

export type FormData = z.infer<typeof FormSchema>
