import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Length, IsNotEmpty, IsEmail, IsIn } from 'class-validator'
import * as bcrypt from 'bcryptjs'
import config from '../config/config'

@Entity(config.userTable)
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    department_id: number

    @Column({ default: 0 })
    @IsNotEmpty()
    parent: number

    @Column()
    @IsNotEmpty()
    @Length(4, 255)
    username: string

    @Column()
    @IsNotEmpty()
    @Length(4, 255)
    fullname: string

    @Column()
    @IsNotEmpty()
    @Length(4, 255)
    address: string

    @Column()
    @IsEmail()
    @Length(4, 255)
    email: string

    @Column()
    @IsNotEmpty()
    @IsIn([0, 1, 2])
    status: number

    @Column({ nullable: true })
    avatar: string

    @Column()
    @IsNotEmpty()
    group_id: number

    @Column()
    @Length(6, 255)
    password: string

    @Column({ nullable: true, default: 0 })
    reset_password: number

    @Column()
    updated_pass: Date

    @Column()
    @IsNotEmpty()
    @Length(10, 16)
    phone: string

    @Column({ nullable: true })
    note: string

    @Column({ nullable: true })
    photo: string

    @Column({ nullable: true })
    thumb: string

    @Column({ nullable: true })
    remember_token: string

    @Column()
    salt: string

    @Column({ default: '' })
    token: string

    @Column({ default: '' })
    google_token: string

    @Column({ default: '' })
    google_refresh_token: string

    @Column({ default: '' })
    activation_key: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    hashPassword(rounds = 10) {
        const salt = bcrypt.genSaltSync(rounds)
        this.salt = salt
        this.password = bcrypt.hashSync(this.password, salt)
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password)
    }
}
