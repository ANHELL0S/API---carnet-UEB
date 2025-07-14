import { env } from '../env-config.js'
import { DatabaseFactory } from './database-factory.js'

// Configuración común para ambas bases de datos
const commonDbConfig = {
	logging: false,
	pool: {
		max: env.NODE_ENV === 'production' ? 10 : 5,
		min: env.NODE_ENV === 'production' ? 2 : 1,
		acquire: 30000,
		idle: 10000,
		evict: 10000,
	},
	define: {
		timestamps: false,
		freezeTableName: true,
	},
	retry: {
		max: 3,
		match: [/ECONNREFUSED/, /EHOSTUNREACH/, /ENOTFOUND/, /EAI_AGAIN/, /ETIMEDOUT/],
	},
	dialectOptions:
		env.NODE_ENV === 'production' && env.DB_SSL === 'true'
			? {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
			  }
			: {},
}

const getSianetDbConfig = () => ({
	dialect: env.DB_SIANET.DIALECT,
	port: parseInt(env.DB_SIANET.PORT),
	host: env.DB_SIANET.HOST,
	database: env.DB_SIANET.NAME,
	username: env.DB_SIANET.USER,
	password: env.DB_SIANET.PASS,
	...commonDbConfig,
})

const getCarnetDbConfig = () => ({
	dialect: env.DB_CARNET.DIALECT,
	port: parseInt(env.DB_CARNET.PORT),
	host: env.DB_CARNET.HOST,
	database: env.DB_CARNET.NAME,
	username: env.DB_CARNET.USER,
	password: env.DB_CARNET.PASS,
	...commonDbConfig,
})

// Crear instancias
const sianetDatabase = new DatabaseFactory(getSianetDbConfig())
const carnetDatabase = new DatabaseFactory(getCarnetDbConfig())

// Exportar funciones
export const connectSianetDatabase = () => sianetDatabase.connect()
export const connectCarnetDatabase = () => carnetDatabase.connect()

// MEJORADO: Función segura para obtener instancia
export const getSianetSequelize = () => sianetDatabase.getInstance()
export const getCarnetSequelize = () => carnetDatabase.getInstance()

// NUEVO: Funciones seguras con auto-conexión
export const getSafeSianetSequelize = () => sianetDatabase.getSafeInstance()
export const getSafeCarnetSequelize = () => carnetDatabase.getSafeInstance()

export const syncSianetDatabase = (options = {}) => sianetDatabase.sync(options)
export const syncCarnetDatabase = (options = {}) => carnetDatabase.sync(options)
export const closeSianetDatabase = () => sianetDatabase.close()
export const closeCarnetDatabase = () => carnetDatabase.close()

// Manejo de cierre de la aplicación
const cleanup = async () => {
	try {
		await closeSianetDatabase()
		await closeCarnetDatabase()
		console.log('🔌 Todas las conexiones de base de datos cerradas')
	} catch (error) {
		console.error('Error al cerrar conexiones:', error)
	}
}

process.on('SIGINT', async () => {
	await cleanup()
	process.exit(0)
})

process.on('SIGTERM', async () => {
	await cleanup()
	process.exit(0)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', error => {
	console.error('Uncaught Exception:', error)
	cleanup().finally(() => process.exit(1))
})
