import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: 'popn_data',
})
export class Popndata extends Model<Popndata> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public song_id!: Number;

    @AllowNull(false)
    @Column(DataType.STRING)
    public medal!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public grade!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public score!: Number;
}
