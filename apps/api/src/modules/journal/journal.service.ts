import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private journalRepository: Repository<Journal>,
  ) {}

  async create(
    userId: string,
    createJournalDto: CreateJournalDto,
  ): Promise<Journal> {
    let date: Date;
    if (createJournalDto.date) {
      // Parse date string (YYYY-MM-DD) and set to start of day in UTC
      const [year, month, day] = createJournalDto.date.split('-').map(Number);
      date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else {
      // Default to today in UTC
      const now = new Date();
      date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
    }

    const journal = this.journalRepository.create({
      userId,
      description: createJournalDto.description,
      date,
    });

    return this.journalRepository.save(journal);
  }

  async findByUserAndDate(userId: string, date: Date): Promise<Journal[]> {
    const dateStr = date.toISOString().split('T')[0];

    return this.journalRepository.find({
      where: {
        userId,
        date: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: dateStr,
        }),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const journal = await this.journalRepository.findOne({
      where: { id, userId },
    });

    if (!journal) {
      return;
    }

    await this.journalRepository.softRemove(journal);
  }
}
