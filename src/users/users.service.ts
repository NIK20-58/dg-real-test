import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      const user = await this.usersRepository.findOneBy({ id: 1 });
      if (!user) {
        this.logger.log('Seeding initial user with id=1 and balance=1000');
        await this.dataSource.transaction(async (manager) => {
          const newUser = manager.create(User, {
            id: 1,
            balance: 1000,
          });
          await manager.save(newUser);
        });
        this.logger.log('Seeding complete');
      }
    } catch (error: any) {
      this.logger.warn(
        'Failed to seed user (might be connection issue if DB is not up): ' +
          error.message,
      );
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getBalance(userId: number): Promise<number> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }
    return user.balance;
  }
}
