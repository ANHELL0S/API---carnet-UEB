import { z } from 'zod'
import { TYPE_USER } from '../../common/constants/typeUser-const.js'

export const createQRSchema = z.object({
	cedula: z.string().min(1, 'Es requerida').max(15, 'Maximos 15 caracteres'),
	tipo: z.enum([TYPE_USER.ESTUDIANTE, TYPE_USER.USUARIO], `Permitidos: ${TYPE_USER.ESTUDIANTE}, ${TYPE_USER.USUARIO}`),
	perfil: z.string().min(1, 'Es requerida').max(255, 'Maximos 255 caracteres'),
})

export const paramSchema = z.object({
	id: z.uuidv4('Debe ser un UUID válido'),
})
