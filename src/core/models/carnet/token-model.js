import { DataTypes } from 'sequelize'
import { getSafeCarnetSequelize } from '../../../config/db/instances.js'

export const TokenModel = async () => {
	try {
		const sequelize = await getSafeCarnetSequelize()

		return sequelize.define(
			'Token',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				token: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				used: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				cl_fk: {
					type: DataTypes.STRING(12),
					allowNull: false,
				},
				expires_at: {
					type: DataTypes.DATE,
					allowNull: false,
					validate: {
						isDate: true,
						isAfter: new Date().toISOString(),
					},
				},
				token_type: {
					type: DataTypes.ENUM('access', 'refresh', 'reset', 'verification'),
					allowNull: false,
				},
			},
			{
				tableName: 'tokens',
				timestamps: true,
				paranoid: true,
				indexes: [
					{
						name: 'idx_token_unique',
						fields: ['token'],
					},
					{
						name: 'idx_active_tokens',
						fields: ['used'],
						where: {
							used: false,
						},
					},
					{
						name: 'idx_user_tokens',
						fields: ['cl_fk'],
					},
					{
						name: 'idx_token_expiration',
						fields: ['expires_at'],
					},
				],
				hooks: {
					beforeValidate: token => {
						if (!token.expires_at && token.token_type) {
							const expires = new Date()
							const ttl = {
								access: 15 * 60 * 1000,
								refresh: 7 * 24 * 60 * 60 * 1000,
								reset: 24 * 60 * 60 * 1000,
								verification: 48 * 60 * 60 * 1000,
							}[token.token_type]

							expires.setTime(expires.getTime() + ttl)
							token.expires_at = expires
						}
					},
				},
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo Token:', error)
		throw new Error(`Error en TokenModel: ${error.message}`)
	}
}
