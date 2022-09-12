import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { IsIn } from 'class-validator'
import config from '../config/config'

@Entity(config.configsTable)
export class Configs {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar',
        nullable: true,
        length: 50,
        default: 'vietnamese',
    })
    language: string

    @Column({
        type: 'varchar',
        nullable: true,
        length: 2048,
    })
    value: string

    @Column({
        type: 'varchar',
        nullable: true,
        length: 127,
    })
    label: string

    @Column(['varchar', { length: 50 }, { default: 1 }])
    @IsIn([0, 1])
    status: string

    @Column({ default: 0 })
    type: number
}
