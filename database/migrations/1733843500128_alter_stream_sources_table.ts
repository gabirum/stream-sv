import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stream_sources'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name', 55)
    })

    this.defer(async (db) => {
      await db.query().update('name', db.knexRawQuery('id')).from(this.tableName)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }
}
