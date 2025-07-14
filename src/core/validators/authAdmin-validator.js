import { z } from 'zod'

export const loginAdminSchema = z.object({
	identification_card: z.string().min(1, 'Es requerida').max(15, 'Maximos 15 caracteres'),
	password: z.string().min(1, 'Es requerida').max(255, 'Maximos 20 caracteres'),
})
