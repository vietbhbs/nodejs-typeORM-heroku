import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm'
import config from '../config/config'

import { IsIn, Length, Min, IsNotEmpty } from 'class-validator'

@Entity(config.categoryTable)
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    uuid: string

    @Column()
    @IsNotEmpty()
    @IsIn([0, 1])
    status: number

    @Column()
    @IsNotEmpty()
    @Length(5, 100)
    name: string

    @Column({
        nullable: true,
        default: 'vietnamese',
        length: 50,
    })
    language: string

    @Column()
    @IsNotEmpty()
    @Length(1, 50)
    slugs: string

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

    @Column({ nullable: true, default: '/' })
    photo: string

    @Column()
    @IsNotEmpty()
    @Min(0)
    parent: number

    @Column({ name: 'order_stt' })
    @IsNotEmpty()
    @Min(0)
    orderStt: number

    @Column({ name: 'show_top' })
    @IsNotEmpty()
    @IsIn([0, 1])
    showTop: boolean

    @Column({ name: 'show_home' })
    @IsNotEmpty()
    @IsIn([0, 1])
    showHome: boolean

    @Column({ name: 'show_right' })
    @IsNotEmpty()
    @IsIn([0, 1])
    showRight: boolean

    @Column({ name: 'show_bottom' })
    @IsNotEmpty()
    @IsIn([0, 1])
    showBottom: boolean

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @Column({ nullable: true })
    @IsIn([0, 1])
    level: boolean
}
