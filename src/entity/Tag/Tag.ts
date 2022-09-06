import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'
import { Length, IsNotEmpty, IsIn } from 'class-validator'

@Entity('tnv_tag')
@Unique([
    'uuid',
    'status',
    'is_hot',
    'name',
    'slugs',
    'language',
    'title',
    'description',
    'keywords',
    'photo',
    'viewed',
    'view_total',
    'view_day',
    'view_week',
    'view_month',
    'view_year',
])
export class Tag {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar', { length: 255 })
    @IsNotEmpty()
    @Length(4, 50)
    uuid: string

    @Column(['varchar', { length: 50 }, { default: 1 }])
    @IsNotEmpty()
    @IsIn([0, 1, 2])
    @Length(1, 4)
    status: string

    @Column({ default: 1 })
    @IsNotEmpty()
    is_hot: number

    @Column('varchar', { length: 100 })
    @IsNotEmpty()
    @Length(4, 50)
    name: string

    @Column('varchar', { length: 100 })
    @IsNotEmpty()
    @Length(4, 50)
    slugs: string

    @Column(['varchar', { length: 50 }, { default: 'vietnamese' }])
    @IsNotEmpty()
    @Length(4, 50)
    language: string

    @Column(['varchar', { length: 100 }, { nullable: true }])
    @IsNotEmpty()
    @Length(4, 50)
    title: string

    @Column(['varchar', { length: 255 }, { nullable: true }])
    @Length(4, 50)
    description: string

    @Column(['varchar', { length: 50 }, { nullable: true }])
    @IsNotEmpty()
    @Length(4, 50)
    keywords: string

    @Column(['varchar', { length: 100 }, { nullable: true }])
    @IsNotEmpty()
    @Length(4, 50)
    photo: string

    @Column(['varchar', { length: 50 }, { nullable: true }])
    @IsNotEmpty()
    @Length(4, 50)
    viewed: string

    @Column(['varchar', { length: 50 }, { nullable: true }])
    @IsNotEmpty()
    @Length(4, 50)
    view_total: string

    @Column(['varchar', { length: 50 }, { nullable: true }])
    @Length(4, 50)
    view_day: string

    @Column({ nullable: true })
    view_week: number

    @Column({ nullable: true })
    view_month: number

    @Column({ nullable: true })
    view_year: number

    @Column()
    @IsNotEmpty()
    created_at: Date

    @Column()
    @IsNotEmpty()
    updated_at: Date
}
