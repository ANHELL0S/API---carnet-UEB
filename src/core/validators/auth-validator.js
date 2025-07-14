import { z } from 'zod'
import { TYPE_USER } from '../../common/constants/typeUser-const.js'

export const loginSchema = z.object({
	cedula: z.string().min(1, 'Es requerida').max(15, 'Maximos 15 caracteres'),
	clave: z.string().min(1, 'Es requerida').max(20, 'Maximos 20 caracteres'),
	tipo: z.enum([TYPE_USER.ESTUDIANTE, TYPE_USER.USUARIO], `Permitidos: ${TYPE_USER.ESTUDIANTE}, ${TYPE_USER.USUARIO}`),
})
