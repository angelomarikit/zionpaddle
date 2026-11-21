import { z } from 'zod'

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Enter full name'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .min(10, 'Enter mobile number')
    .regex(/^[\d\s+()-]+$/, 'Use digits only'),
  line1: z.string().min(4, 'Street / unit required'),
  line2: z.string().optional(),
  barangay: z.string().min(2, 'Barangay required'),
  city: z.string().min(2, 'City required'),
  province: z.string().min(2, 'Province required'),
  postalCode: z.string().min(4, 'Postal code required'),
})

export type ShippingAddressForm = z.infer<typeof shippingAddressSchema>