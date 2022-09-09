import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

import { IsIn, Length, IsNotEmpty } from 'class-validator'
import config from '../config/config'

@Entity(config.topicTable)
export class Topic {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar',
        length: 36,
    })
    @IsNotEmpty()
    uuid: string

    @Column({
        type: 'tinyint',
        precision: 1,
    })
    @IsNotEmpty()
    @IsIn([0, 1])
    status: number

    @Column({
        name: 'is_hot',
        type: 'tinyint',
        precision: 1,
    })
    @IsNotEmpty()
    @IsIn([0, 1])
    isHost: number

    @Column({
        type: 'varchar',
        length: 256,
    })
    @IsNotEmpty()
    @Length(5, 100)
    name: string

    @Column({
        type: 'varchar',
        length: 256,
    })
    @IsNotEmpty()
    @Length(1, 50)
    slugs: string

    @Column({
        type: 'varchar',
        nullable: true,
        length: 50,
    })
    language: string

    @Column({
        type: 'varchar',
        length: 256,
    })
    @IsNotEmpty()
    @Length(5, 256)
    title: string

    @Column({
        type: 'varchar',
        length: 256,
    })
    @IsNotEmpty()
    @Length(5, 256)
    description: string

    @Column({
        type: 'varchar',
        length: 256,
    })
    @IsNotEmpty()
    @Length(5, 256)
    keywords: string

    @Column({
        nullable: true,
        type: 'text',
    })
    content: string

    @Column({
        type: 'text',
        comment: 'Json String',
    })
    @IsNotEmpty()
    photo: string

    @Column({
        type: 'text',
        nullable: true,
        default: '0',
    })
    viewed: string

    @Column({
        type: 'int',
        name: 'view_total',
        precision: 10,
        default: 0,
    })
    viewTotal: number

    @Column({
        type: 'int',
        name: 'view_day',
        precision: 10,
        default: 0,
    })
    viewDay: number

    @Column({
        type: 'int',
        name: 'view_week',
        precision: 10,
        default: 0,
    })
    viewWeek: number

    @Column({
        type: 'int',
        name: 'view_month',
        precision: 10,
        default: 0,
    })
    viewMonth: number

    @Column({
        type: 'int',
        name: 'view_year',
        precision: 10,
        default: 0,
    })
    viewYear: number

    @CreateDateColumn({
        type: 'datetime',
        name: 'created_at',
        nullable: true,
    })
    createdAt: Date

    @UpdateDateColumn({
        type: 'datetime',
        name: 'updated_at',
        nullable: true,
    })
    updatedAt: Date
}
