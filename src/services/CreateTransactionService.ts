import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionReposirory from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  type: 'income' | 'outcome';
  value: number;
  title: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    type,
    title,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionReposirory = getCustomRepository(TransactionReposirory);
    const categoryReposirory = getRepository(Category);

    const balance = await transactionReposirory.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'There is not enough balance to complete this transaction',
      );
    }

    const normalizedCategory =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    const categoryExists = await categoryReposirory.findOne({
      where: { title: normalizedCategory },
    });

    let category_id: string;

    if (!categoryExists) {
      const newCategory = categoryReposirory.create({
        title: normalizedCategory,
      });
      await categoryReposirory.save(newCategory);

      category_id = newCategory.id;
    } else {
      category_id = categoryExists.id;
    }

    const transaction = transactionReposirory.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionReposirory.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
