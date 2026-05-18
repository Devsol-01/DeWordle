import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateWordsTable1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'words',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'word',
            type: 'varchar',
            length: '5',
            isUnique: true,
          },
          {
            name: 'definition',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'example',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'partOfSpeech',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'phonetics',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'isDaily',
            type: 'boolean',
            default: false,
          },
          {
            name: 'dailyDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_words_word',
            columnNames: ['word'],
          },
          {
            name: 'IDX_words_isDaily',
            columnNames: ['isDaily'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('words');
  }
}
