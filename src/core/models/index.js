import { env } from '../../config/env-config.js'
import { getSafeSianetSequelize, getSafeCarnetSequelize } from '../../config/db/instances.js'

import { QrModel } from './carnet/qr-model.js'
import { TokenModel } from './carnet/token-model.js'
import { AdminModel } from './carnet/admin-model.js'
import { ServiceModel, QrServiceModel } from './carnet/service-model.js'

import { DocenteModel } from './sianet/docente-model.js'
import { UsuariosModel } from './sianet/usuarios-model.js'
import { CorreoUebModel } from './sianet/correo_ueb-model.js'
import { ThPersonalModel } from './sianet/th_personal-model.js'
import { SmeEstuClaveModel } from './sianet/sme_estu_clave-model.js'
import { SmeNuevosEstuModel } from './sianet/sme_nuevos_estu-model.js'
import { SmeVeriCorreoModel } from './sianet/sme_veri_correo-model.js'
import { SmeNuevosEstu25Model } from './sianet/sme_nuevos_estu25-model.js'
import { UsuariosSistemasModel } from './sianet/usuarios_sistemas-model.js'

export const initializeSianetModels = async () => {
	console.log(`🔄 Inicializando modelos de ${env.DB_SIANET_NAME} Database...`)

	const sequelize = await getSafeSianetSequelize()

	const models = {
		correoUeb: CorreoUebModel(sequelize),
		docente: DocenteModel(sequelize),
		smeEstuClave: SmeEstuClaveModel(sequelize),
		smeNuevosEstu: SmeNuevosEstuModel(sequelize),
		smeNuevosEstu25: SmeNuevosEstu25Model(sequelize),
		smeVeriCorreo: SmeVeriCorreoModel(sequelize),
		thPersonal: ThPersonalModel(sequelize),
		usuarios: UsuariosModel(sequelize),
		usuariosSistemas: UsuariosSistemasModel(sequelize),
	}

	try {
		await models.correoUeb
		await models.docente
		await models.smeEstuClave
		await models.smeNuevosEstu
		await models.smeNuevosEstu25
		await models.smeVeriCorreo
		await models.thPersonal
		await models.usuarios
		await models.usuariosSistemas

		console.log(`✅ Modelos ${env.DB_SIANET_NAME} verificados y funcionando`)
	} catch (error) {
		console.error('❌ Los modelos no pueden comunicarse con la DB:', error)
		throw error
	}
	return models
}

export const initializeCarnetModels = async () => {
	console.log(`🔄 Inicializando modelos de ${env.DB_CARNET_NAME} Database...`)

	const sequelize = await getSafeCarnetSequelize()

	const models = {
		token: TokenModel(sequelize),
		codeQR: QrModel(sequelize),
		admin: AdminModel(sequelize),
		service: ServiceModel(sequelize),
		qrService: QrServiceModel(sequelize),
	}

	try {
		await models.token
		await models.codeQR
		await models.admin
		console.log(`✅ Modelos ${env.DB_CARNET_NAME} verificados y funcionando`)
	} catch (error) {
		console.error('❌ Los modelos no pueden comunicarse con la DB:', error)
		throw error
	}

	return models
}
