import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import cookieParser from 'cookie-parser'

export const miscMiddlewares = app => {
	app.use(cors())
	app.use(helmet())
	app.use(morgan('dev'))
	app.use(cookieParser())
	app.use(express.json())
}
