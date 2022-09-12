import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'
import { IsIn } from 'class-validator'
import config from '../config/config'

@Entity(config.optionTable)
export class Option {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string

    @Column({
        type: 'varchar',
        length: 2048,
    })
    value: string

    @Column(['varchar', { length: 50 }, { default: 1 }])
    @IsIn([0, 1])
    status: string

    @UpdateDateColumn({
        type: 'datetime',
        name: 'create_at',
        nullable: true,
    })
    updatedAt: Date
}
