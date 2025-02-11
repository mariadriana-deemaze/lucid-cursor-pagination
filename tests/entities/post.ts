import { DateTime } from 'luxon'
import {
 BaseModel,
 column,
} from '@adonisjs/lucid/orm'
import type { UUID } from 'node:crypto'

export default class Post extends BaseModel {
 @column({ isPrimary: true })
 declare id: UUID

 @column()
 declare content: string

 @column()
 declare pinned: boolean

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime | null
}
