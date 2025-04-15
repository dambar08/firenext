import { Queue, QueueOptions, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/env';

const connection: QueueOptions['connection'] = new Redis(env.REDIS_URL);

class BaseQueue<T> {
  public queue: Queue;

  constructor(queueName: string, options?: QueueOptions) {
    this.queue = new Queue(queueName, { connection, ...options });
  }

  public async addJob(name: string, data: T, options?: Parameters<Queue['add']>[2]): Promise<Job<T>> {
    return this.queue.add(name, data, options);
  }
}

interface DataProcessingJob {
  data: any;
}

class DataProcessingQueue extends BaseQueue<DataProcessingJob> {
  constructor() {
    super('data-processing');
  }

  public async addJob(data: DataProcessingJob['data']): Promise<Job<DataProcessingJob>> {
    return super.addJob('data-processing', { data });
  }
}

export const dataProcessingQueue = new DataProcessingQueue();