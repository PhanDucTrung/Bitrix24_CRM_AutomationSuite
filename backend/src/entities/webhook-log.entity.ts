// src/webhook/entities/webhook-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class WebhookLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  type: string; 

  @Column('json')
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}
