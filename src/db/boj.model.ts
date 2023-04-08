import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'boj',
    timestamps: false,
})
export class Boj extends Model<Boj> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public nick!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public rating!: Number;

    @AllowNull(false)
    @Column(DataType.STRING)
    public grade!: string;

    @AllowNull(false)
    @Column(DataType.TEXT({ length: 'medium' }))
    public solved!: string;
}
