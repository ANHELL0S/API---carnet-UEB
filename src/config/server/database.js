import {
	connectCarnetDatabase,
	connectSianetDatabase,
	syncCarnetDatabase,
	syncSianetDatabase,
	getSafeSianetSequelize,
	getSafeCarnetSequelize,
} from '../db/instances.js'
import { env } from '../env-config.js'
import { seedGod } from '../../seeders/god-seeder.js'
import { initializeCarnetModels, initializeSianetModels } from '../../core/models/index.js'

const getDBSyncOptions = () => {
	const baseOptions = {
		logging: false,
		hooks: true,
	}

	return env.NODE_ENV === 'development' ? { ...baseOptions, force: false, alter: true } : baseOptions
}

const initializeDatabase = async config => {
	const { name, connectFn, initializeModelsFn, syncFn } = config
	console.log(`\n> INICIALIZANDO ${name} DATABASE <\n`)
	await connectFn()
	await initializeModelsFn()
	await syncFn(getDBSyncOptions())
}

export const initializeAllDatabases = async () => {
	console.log('\n=== INICIO DE INICIALIZACIÓN ===')

	await initializeDatabase({
		name: env.DB_SIANET_NAME,
		connectFn: connectSianetDatabase,
		initializeModelsFn: initializeSianetModels,
		syncFn: syncSianetDatabase,
	})

	await initializeDatabase({
		name: env.DB_CARNET_NAME,
		connectFn: connectCarnetDatabase,
		initializeModelsFn: initializeCarnetModels,
		syncFn: syncCarnetDatabase,
	})

	await seedGod()

	// Verificación final
	const sianetSequelize = await getSafeSianetSequelize()
	const carnetSequelize = await getSafeCarnetSequelize()

	console.log('\n=== ESTADO FINAL ===')
	console.log(`🔴 DB ${env.DB_SIANET_NAME}: ${sianetSequelize.authenticate ? 'CONECTADA' : 'DESCONECTADA'}`)
	console.log(`🔵 DB ${env.DB_CARNET_NAME}: ${carnetSequelize.authenticate ? 'CONECTADA' : 'DESCONECTADA'}`)
}
