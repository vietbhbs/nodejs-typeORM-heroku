import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { IsIn, Length } from 'class-validator'

@Entity('tnv_data_signature')
export class Signature {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true, length: 50, comment: 'Chính là ClientID' })
    @Length(4, 50)
    nickname: string

    @Column({ type: 'text', nullable: true, comment: 'Chính là Secret Key' })
    signature: string

    @Column({
        type: 'tinyint',
        width: 1,
        nullable: true,
        comment: '1: active 2: unactive',
    })
    @IsIn([1, 2])
    status: number

    @Column({
        type: 'tinyint',
        width: 1,
        nullable: true,
        comment: 'Quyền: 1. Push 2. Pull 3. Full ',
    })
    @IsIn([1, 2, 3])
    role: number

    @Column({ nullable: true, comment: 'Mô tả: quyền này được cấp cho ai' })
    @Length(4, 255)
    description: string
}
