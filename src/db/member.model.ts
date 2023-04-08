import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'member',
    timestamps: false,
})
export class Member extends Model<Member> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public chatroom_name!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public info_id!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public info_pw!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public info_svid!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public permission!: boolean;
}
