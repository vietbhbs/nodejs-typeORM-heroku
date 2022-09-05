import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm'

import { IsIn, Length, IsNotEmpty } from 'class-validator'

@Entity('tnv_topic')
export class Topic {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    uuid: string

    @Column()
    @IsNotEmpty()
    @IsIn([0, 1])
    status: number

    @Column({ name: 'is_host' })
    @IsNotEmpty()
    @IsIn([0, 1])
    isHost: number

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(5, 100)
    name: string

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 50)
    slugs: string

    @Column({
        nullable: true,
        length: 50,
    })
    language: string

    @Column()
    @IsNotEmpty()
    @Length(5, 256)
    title: string

    @Column()
    @IsNotEmpty()
    @Length(5, 256)
    description: string

    @Column()
    @IsNotEmpty()
    @Length(5, 256)
    keywords: string

    @Column({ nullable: true })
    content: string

    @Column()
    @IsNotEmpty()
    photo: string

    @Column({ nullable: true, default: '0' })
    viewed: string

    @Column({ name: 'view_total', default: 0 })
    viewTotal: number

    @Column({ name: 'view_day', default: 0 })
    viewDay: number

    @Column({ name: 'view_week', default: 0 })
    viewWeek: number

    @Column({ name: 'view_month', default: 0 })
    viewMonth: number

    @Column({ name: 'view_year', default: 0 })
    viewYear: number

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date
}
