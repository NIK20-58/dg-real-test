import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly userService: UsersService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    this.logger.log(
      `Attempting to create payment for userId: ${createPaymentDto.userId}, amount: ${createPaymentDto.amount}, action: ${createPaymentDto.action}`,
    );
    const { userId, amount, action } = createPaymentDto;

    // Быстрая проверка баланса БЕЗ блокировки
    const currentBalance = await this.userService.getBalance(userId);
    if (currentBalance < amount) {
      this.logger.warn(
        `Insufficient funds for user ${userId}. Current balance: ${currentBalance}, attempted deduction: ${amount}.`,
      );
      throw new BadRequestException('Insufficient funds');
    }

    return this.dataSource.transaction(async (manager) => {
      // Блокировка ТОЛЬКО на время обновления
      const result = await manager
        .createQueryBuilder()
        .update(User)
        .set({
          balance: () => `balance - ${amount}`,
        })
        .where('id = :userId AND balance >= :amount', {
          userId,
          amount,
        })
        .execute();

      if (result.affected === 0) {
        this.logger.warn(
          `Failed to deduct ${amount} from user ${userId}. Balance might have changed or user not found.`,
        );
        // Если не удалось обновить - значит баланс изменился или пользователь не найден
        throw new BadRequestException(
          'Payment failed. Insufficient funds or user not found',
        );
      }

      // Создаем запись в истории платежей
      const payment = manager.create(Payment, {
        user_id: userId,
        action: action,
        amount: -amount,
      });
      await manager.save(payment);

      this.logger.log(
        `Payment successfully processed for user ${userId}. Transaction ID: ${payment.id}.`,
      );
      return {
        success: true,
        transactionId: payment.id,
      };
    });
  }
}
