import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateCategoryAndTransactionTables1587256475118
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoriesTable = new Table({
      name: 'categories',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'title',
          type: 'varchar',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    });

    const transactionsTable = new Table({
      name: 'transactions',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'title',
          type: 'varchar',
        },
        {
          name: 'value',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
        },
        {
          name: 'type',
          type: 'varchar',
          isNullable: false,
          enum: ['income', 'outcome'],
        },
        {
          name: 'category_id',
          type: 'uuid',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    });

    const foreignKeyCategoryId = new TableForeignKey({
      name: 'category_id_fk',
      columnNames: ['category_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'categories',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryRunner.createTable(categoriesTable);
    await queryRunner.createTable(transactionsTable);
    await queryRunner.createForeignKey('transactions', foreignKeyCategoryId);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'category_id_fk');
    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('categories');
  }
}
