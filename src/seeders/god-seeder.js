import bcrypt from 'bcrypt'
import { env } from '../config/env-config.js'
import { AdminModel } from '../core/models/carnet/admin-model.js'

const SALT_ROUNDS = 10

export const seedGod = async () => {
	try {
		const God = await AdminModel()
		const count = await God.count()

		if (count > 0) {
			console.log('✅ Ya existen registros en la tabla Admin, se omite el seeder')
			return
		}

		const hashedPassword = await bcrypt.hash(env.ADMIN_CREDENTIALS.PASS, SALT_ROUNDS)

		const godUsers = [
			{
				identification_card: env.ADMIN_CREDENTIALS.USER,
				password: hashedPassword,
			},
		]

		await God.bulkCreate(godUsers)
		console.log('✅ Seeder para God ejecutado correctamente')
	} catch (error) {
		console.error('❌ Error ejecutando el seeder de God:', error)
		throw error
	}
}
