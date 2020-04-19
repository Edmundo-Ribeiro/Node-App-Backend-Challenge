import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import path from 'path';
import Transaction from '../models/Transaction';
import csvUploadConfig from '../config/csvUploadConfig';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const filePath = path.resolve(csvUploadConfig.directoryPath, filename);

    const rawData = await fs.promises.readFile(filePath, 'utf8');
    const normalizedData = rawData.split(', ').join(',');

    interface RawTransaction {
      type: string;
      title: string;
      value: string;
      category: string;
    }

    const parsedCsv = parse(normalizedData, {
      columns: true,
      skip_empty_lines: true,
    }) as RawTransaction[];

    await fs.promises.unlink(filePath);

    const transactions: Transaction[] = [];

    for (const { title, type, value, category } of parsedCsv) {
      const transaction = await createTransactionService.execute({
        title,
        type: type === 'income' ? 'income' : 'outcome',
        value: parseInt(value, 10),
        category,
      });

      transactions.push(transaction);
    }
    return transactions;
  }
}

export default ImportTransactionsService;
