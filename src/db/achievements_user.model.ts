import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'achievements_user',
    updatedAt: false,
    timestamps: true,
    createdAt: "createdAt"
})
export class AchievementsUser extends Model<AchievementsUser> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public achievements_id!: Number;

    @AllowNull(false)
    @Column(DataType.DATE)
    public createdAt!: Date;
}
