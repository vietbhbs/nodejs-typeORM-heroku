import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Length, IsNotEmpty, IsIn } from 'class-validator'
import config from '../config/config'

@Entity(config.tagTable)
export class Tag {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar', { length: 255 })
    @IsNotEmpty()
    @Length(4, 50)
    uuid: string

    @Column(['varchar', { length: 50 }, { default: 1 }])
    @IsIn([0, 1])
    status: string

    @Column({ default: 1 })
    @IsNotEmpty()
    is_hot: number

    @Column()
    @IsNotEmpty()
    @Length(5, 100)
    name: string

    @Column('varchar', { length: 100 })
    @IsNotEmpty()
    @Length(4, 50)
    slugs: string

    @Column({
        type: 'varchar',
        nullable: true,
        length: 50,
    })
    language: string

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    keywords: string

    @Column()
    photo: string

    @Column({
        type: 'text',
        nullable: true,
        // default: '0',
    })
    viewed: string

    @Column({
        type: 'int',
        name: 'view_total',
        precision: 10,
        default: 0,
    })
    view_total: number

    @Column({
        type: 'int',
        name: 'view_day',
        precision: 10,
        default: 0,
    })
    view_day: number

    @Column({
        type: 'int',
        name: 'view_week',
        precision: 10,
        default: 0,
    })
    view_week: number

    @Column({
        type: 'int',
        name: 'view_month',
        precision: 10,
        default: 0,
    })
    view_month: number

    @Column({
        type: 'int',
        name: 'view_year',
        precision: 10,
        default: 0,
    })
    view_year: number

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
