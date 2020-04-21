import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RawTransaction {
  type: 'income' | 'outcome';
  title: string;
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const rawData = await fs.promises.readFile(filePath, 'utf8');
    await fs.promises.unlink(filePath);

    const parsedCsv = parse(rawData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as RawTransaction[];

    const categories = parsedCsv.map(
      ({ category }: RawTransaction) => category,
    );
    const differentCategories = categories.filter((category, index, self) => {
      return self.indexOf(category) === index;
    });

    const existingCategories = await categoryRepository.find({
      where: { title: In(differentCategories) },
    });
    const existingCategoriesTitles = existingCategories.map(
      ({ title }: Category) => title,
    );

    const notExistingCategories = differentCategories.filter(
      title => !existingCategoriesTitles.includes(title),
    );

    const newCategories = categoryRepository.create(
      notExistingCategories.map(title => ({ title })),
    );

    await categoryRepository.save(newCategories);

    const allCategories = [...newCategories, ...existingCategories];
    const createTransacions = parsedCsv.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: Number(transaction.value),
      category: allCategories.find(
        enity => enity.title === transaction.category,
      ),
    }));

    const transactions = transactionRepository.create(createTransacions);
    await transactionRepository.save(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
