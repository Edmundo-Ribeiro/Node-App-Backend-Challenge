import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionReposiroty = getRepository(Transaction);

    const transaction = await transactionReposiroty.findOne({ where: { id } });

    if (!transaction) {
      throw new AppError(`There is no transaction with the id: ${id}`);
    }

    await transactionReposiroty.delete(id);
  }
}

export default DeleteTransactionService;
