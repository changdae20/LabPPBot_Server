import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'counter',
    timestamps: false,
})
export class Counter extends Model<Counter> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public description!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public default_value!: Number;

}
