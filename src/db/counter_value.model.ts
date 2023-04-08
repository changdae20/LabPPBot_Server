import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'counter_value',
    timestamps: false,
})
export class CounterValue extends Model<CounterValue> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public counter_id!: Number;
    
    @AllowNull(false)
    @Column(DataType.BIGINT)
    public counter_value!: Number;

}