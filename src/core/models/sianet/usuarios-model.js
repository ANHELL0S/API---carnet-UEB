import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const UsuariosModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'usuario',
			{
				ci_user: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
				},
				nom_user: {
					type: DataTypes.STRING(42),
					allowNull: false,
				},
				apell_user: {
					type: DataTypes.STRING(42),
					allowNull: false,
				},
				clave: {
					type: DataTypes.STRING(42),
					allowNull: false,
				},
			},
			{
				tableName: 'usuarios',
				timestamps: false,
				indexes: [
					{
						name: 'idx_usuario_nombre',
						fields: ['nom_user'],
						using: 'BTREE',
					},
					{
						name: 'idx_usuario_apellido',
						fields: ['apell_user'],
						using: 'BTREE',
					},
					{
						name: 'idx_usuario_nombre_completo',
						fields: ['nom_user', 'apell_user'],
						using: 'BTREE',
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo usuarios:', error)
		throw new Error(`Error en UsuariosModel: ${error.message}`)
	}
}
