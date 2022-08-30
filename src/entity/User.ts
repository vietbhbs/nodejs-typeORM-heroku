import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm'
import {
    Length,
    IsNotEmpty,
    IsEmail,
    IsDate,
    IsIn
} from 'class-validator'
import * as bcrypt from 'bcryptjs'
import config from '../config/config'

@Entity(config.userTable)
@Unique(['username'])
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    department_id: number

    @Column({default: 0})
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

    @Column({nullable:true})
    avatar: string

    @Column()
    @IsNotEmpty()
    group_id: number

    @Column()
    @IsNotEmpty()
    @Length(6, 255)
    password: string

    @Column({nullable: true, default: 0})
    reset_password: number

    @Column()
    @IsNotEmpty()
    @IsDate()
    updated_pass: Date

    @Column()
    @IsNotEmpty()
    @Length(10, 16)
    phone: string

    @Column({nullable: true})
    note: string

    @Column({nullable: true})
    photo: string

    @Column({nullable: true})
    thumb: string

    @Column({nullable: true})
    remember_token: string

    @Column()
    @IsNotEmpty()
    salt: string

    @Column()
    @IsNotEmpty()
    token: string

    @Column()
    @IsNotEmpty()
    google_token: string

    @Column()
    @IsNotEmpty()
    google_refresh_token: string

    @Column()
    @IsNotEmpty()
    activation_key: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8)
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password)
    }
}
