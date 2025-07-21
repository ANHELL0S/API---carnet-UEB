import { TYPE_USER } from '../../common/constants/typeUser-const.js'
import { createQRSchema, paramSchema } from '../validators/qr-validator.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'

import { qrService } from '../services/qr-service.js'
import { docenteService } from '../services/docente-service.js'
import { thPersonalService } from '../services/thPersonal-service.js'
import { smeNuevosEstuService } from '../services/smeNuevosEstu-service.js'
import { usuariosSistemasService } from '../services/usuariosSistemas-service.js'

export class QrController {
	static async createQrCode(req, res) {
		try {
			const { user } = req

			const validation = handleZodValidation(createQRSchema, req.user)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			let userDetails

			switch (user.tipo) {
				case TYPE_USER.ESTUDIANTE:
					userDetails = await smeNuevosEstuService.findByFields({ cedula: user.cedula }, { exactMatch: true })
					break
				case TYPE_USER.USUARIO:
					userDetails = await usuariosSistemasService.findByFields({ ci_user: user.cedula }, { exactMatch: true })
					break
			}

			if (!userDetails) {
				return sendResponse(res, {
					statusCode: 404,
					message: `No se encontró usuario con cédula ${user.cedula} como ${user.tipo}`,
					details: 'Verifique el tipo de usuario y la cédula',
				})
			}

			const qrData = {
				cedula: user.cedula,
				tipo: user.tipo,
				perfil: user.perfil,
			}

			const newQr = await qrService.generateQRCode(qrData)

			return sendResponse(res, {
				statusCode: 201,
				data: newQr,
				message: `Código QR generado para ${newQr.user_type}:${newQr.user_system}`,
			})
		} catch (error) {
			console.error('Error en createQrCode:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
				data: error.existingQr,
			})
		}
	}

	static async getAllQrCodes(req, res) {
		try {
			const { page = 1, limit = 10, search = '' } = req.query

			// Validación de parámetros de paginación
			const pageNum = parseInt(page)
			const limitNum = parseInt(limit)

			if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de paginación inválidos',
				})
			}

			// Obtener los códigos QR
			const result = await qrService.getAllQrCodes({
				page: pageNum,
				limit: limitNum,
				search,
			})

			return sendResponse(res, {
				statusCode: 200,
				data: {
					items: result.data,
					pagination: result.pagination,
				},
				message: 'Códigos QR obtenidos exitosamente',
			})
		} catch (error) {
			console.error('Error en getAllQrCodes:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener los códigos QR',
				error: {
					code: error.code || 'QR_FETCH_ERROR',
					details: error.details || null,
				},
			})
		}
	}

	static async getQrById(req, res) {
		try {
			const validation = handleZodValidation(paramSchema, req.params)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			const qr = await qrService.findById(req.params.id)

			return sendResponse(res, {
				statusCode: 200,
				data: qr,
			})
		} catch (error) {
			console.error('Error in getQrById:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}

	static async verifyQR(req, res) {
		try {
			const validation = handleZodValidation(paramSchema, req.params)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			const qr = await qrService.findById(req.params.id)

			if (!qr) {
				return sendResponse(res, {
					statusCode: 404,
					message: 'Código QR no encontrado',
				})
			}

			if (qr.is_expired || new Date(qr.expiration_date) < new Date()) {
				return sendResponse(res, {
					statusCode: 410,
					message: 'El código QR ha expirado',
				})
			}

			// Obtener información del usuario según su tipo
			let userInfo
			switch (qr.user_type) {
				case TYPE_USER.ESTUDIANTE:
					userInfo = await smeNuevosEstuService.findByFields({ cedula: qr.cl_fk }, { exactMatch: true })
					break
				case TYPE_USER.USUARIO:
					const usuarioSistema = await usuariosSistemasService.findByFields({ ci_user: qr.cl_fk }, { exactMatch: true })
					if (!usuarioSistema) {
						return sendResponse(res, {
							statusCode: 404,
							message: 'Usuario no encontrado en el sistema',
						})
					}

					// Extraer los valores del usuario
					userInfo = {
						...(usuarioSistema.dataValues || usuarioSistema),
						perfil: (usuarioSistema.dataValues || usuarioSistema).perfil,
					}

					// Si es DOCENTE, consultar adicionalmente en docenteService
					if (userInfo.perfil === 'DOCENTE') {
						const docenteInfo = await docenteService.findByFields({ ci_doc: qr.cl_fk }, { exactMatch: true })
						if (docenteInfo) {
							userInfo = {
								...userInfo,
								...(docenteInfo.dataValues || docenteInfo),
							}
						}
					} else {
						const personal = await thPersonalService.findByFields({ cedula: qr.cl_fk }, { exactMatch: true })
						if (personal) {
							userInfo = {
								...userInfo,
								...(personal.dataValues || personal),
							}
						}
					}
					break
				default:
					return sendResponse(res, {
						statusCode: 400,
						message: 'Tipo de usuario no válido en el QR',
					})
			}

			if (!userInfo) {
				return sendResponse(res, {
					statusCode: 404,
					message: 'Usuario no encontrado en el sistema',
					details: `El usuario con cédula ${qr.cl_fk} no existe como ${qr.user_type}`,
				})
			}

			// Formatear la respuesta según el tipo de usuario
			let responseData = {
				id: qr.id,
				user_type: qr.user_type,
				user_system: qr.user_system,
				expires_at: qr.expiration_date,
				is_expired: qr.is_expired,
				createdAt: qr.createdAt,
				updatedAt: qr.updatedAt,
				deletedAt: qr.deletedAt,
				user: {},
			}

			// Mapear campos según el tipo de usuario
			switch (qr.user_type) {
				case TYPE_USER.ESTUDIANTE:
					responseData.user = {
						datos_personales: {
							cedula: userInfo?.cedula || null,
							nombres: userInfo?.nombres || null,
							apellidos: userInfo?.apellidos || null,
							genero: userInfo?.genero || null,
							etnia: userInfo?.etnia || null,
							fecha_nacimiento: userInfo?.fecha_nac || null,
							estado_civil: userInfo?.estado_civil || null,
							tipo_sangre: userInfo?.tipo_sangre || null,
							foto: userInfo?.foto || null,
							discapacidad: {
								tiene_discapacidad: userInfo?.tiene_discapacidad || null,
								porcentaje: userInfo?.porcentaje || null,
								grado: userInfo.grado || null,
								carnet: userInfo?.carnet || null,
							},
						},
						contacto: {
							telefono: userInfo?.telefono || null,
							celular: userInfo?.celular,
							email_personal: userInfo?.email || null,
							email_institucional: userInfo?.email_institucional || null,
						},
						direccion: {
							nacionalidad: userInfo?.nacionalidad || null,
							pais: userInfo?.pais || null,
							provincia: userInfo?.provincia || null,
							ciudad: userInfo?.ciudad || null,
							calle_principal: userInfo?.direccion || null,
						},
						datos_academicos: {
							carrera: userInfo?.n_carr || null,
							modalidad: userInfo?.modalidad || null,
							paralelo: userInfo?.paralelo || null,
							perfil: 'ESTUDIANTE',
							estado: userInfo.estado || null,
							fecha_ingreso: userInfo?.fecha_i || null,
						},
					}
					break

				case TYPE_USER.USUARIO:
					if (userInfo.perfil === 'DOCENTE') {
						responseData.user = {
							datos_personales: {
								cedula: userInfo?.ci_user || userInfo?.ci_doc,
								nombres: userInfo?.nombres_doc || null,
								apellidos: userInfo?.apellidos_doc || null,
								genero: userInfo?.genero || null,
								etnia: userInfo?.etnia || null,
								fecha_nacimiento: userInfo?.fecha_nac || null,
								estado_civil: userInfo?.estado_civil || null,
								tipo_sangre: userInfo?.tipo_sangre || null,
								foto: userInfo?.foto || null,
								discapacidad: {
									tiene_discapacidad: userInfo?.tiene_discapacidad || null,
									porcentaje: userInfo?.porcentaje || null,
									grado: userInfo?.grado || null,
									carnet: userInfo?.carnet || null,
								},
							},
							contacto: {
								telefono: userInfo?.telefono || null,
								celular: userInfo?.celular || null,
								email_personal: userInfo?.mail || null,
								email_institucional: userInfo?.nick || null,
							},
							direccion: {
								nacionalidad: userInfo.nacionalidad || null,
								pais: userInfo.pais || null,
								residencia: userInfo.ciudad || null,
								calle_principal: userInfo.direccion || null,
							},
							datos_profesionales: {
								perfil: userInfo?.perfil || null,
								estado: userInfo?.estado || null,
								fecha_ingreso: userInfo?.fecha_i || null,
							},
						}
					} else {
						responseData.user = {
							datos_personales: {
								cedula: userInfo?.ci_user || userInfo.ci_doc,
								nombres: userInfo?.nombres || null,
								apellidos: userInfo?.apellidos || null,
								genero: userInfo?.genero || null,
								etnia: userInfo?.etnia || null,
								fecha_nacimiento: userInfo?.fecha_nac || null,
								estado_civil: userInfo?.estado_civil || null,
								tipo_sangre: userInfo?.tipo_sangre || null,
								foto: userInfo?.fotografia || null,
								discapacidad: {
									tiene_discapacidad: userInfo?.discapacidad || null,
									porcentaje: userInfo?.porcentaje || null,
									grado: userInfo?.grado_dis || null,
									carnet: userInfo?.carnet || null,
								},
							},
							contacto: {
								telefono: userInfo?.telefono || null,
								celular: userInfo.celular || null,
								email_personal: userInfo.mail || null,
								email_institucional: userInfo.nick,
							},
							direccion: {
								nacionalidad: userInfo.pais_na || null,
								pais: userInfo.pais_na || null,
								residencia: userInfo.ciudad_dire || null,
								calle_principal: userInfo.calle_p || null,
							},
							datos_laborales: {
								perfil: userInfo.perfil || null,
								estado: userInfo.estado || null,
								fecha_ingreso: userInfo?.fecha_i || null,
							},
						}
					}
					break
			}

			return sendResponse(res, {
				statusCode: 200,
				message: 'QR verificado exitosamente',
				data: responseData,
			})
		} catch (error) {
			console.error('Error en verifyQR:', error)
			return sendResponse(res, {
				statusCode: 500,
			})
		}
	}
}
