import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const UsuariosSistemasModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'usuariosSistemas',
			{
				ci_user: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
				},
				cod_sis: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					allowNull: false,
				},
				perfil: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
				cod_fac: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				cod_esc: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				estado: {
					type: DataTypes.STRING(12),
					allowNull: false,
				},
				fecha_i: {
					type: DataTypes.DATEONLY,
					allowNull: true,
				},
				fecha_f: {
					type: DataTypes.DATEONLY,
					allowNull: true,
				},
				cod_carr: {
					type: DataTypes.STRING(50),
					allowNull: true,
				},
			},
			{
				tableName: 'usuarios_sistemas',
				timestamps: false,
				indexes: [
					// Índice para búsqueda por usuario
					{
						name: 'idx_usuario_sistemas_ci_user',
						fields: ['ci_user'],
						using: 'BTREE',
					},
					// Índice para búsqueda por sistema
					{
						name: 'idx_usuario_sistemas_cod_sis',
						fields: ['cod_sis'],
						using: 'BTREE',
					},
					// Índice para búsqueda por facultad
					{
						name: 'idx_usuario_sistemas_cod_fac',
						fields: ['cod_fac'],
						using: 'BTREE',
					},
					// Índice para búsqueda por escuela
					{
						name: 'idx_usuario_sistemas_cod_esc',
						fields: ['cod_esc'],
						using: 'BTREE',
					},
					// Índice para búsqueda por estado
					{
						name: 'idx_usuario_sistemas_estado',
						fields: ['estado'],
						using: 'BTREE',
					},
					// Índice para búsqueda por carrera
					{
						name: 'idx_usuario_sistemas_cod_carr',
						fields: ['cod_carr'],
						using: 'BTREE',
					},
					// Índice compuesto usuario-sistema (alternativo a PK)
					{
						name: 'idx_usuario_sistemas_ci_user_cod_sis',
						fields: ['ci_user', 'cod_sis'],
						using: 'BTREE',
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo usuarios_sistemas:', error)
		throw new Error(`Error en UsuariosSistemasModel: ${error.message}`)
	}
}
