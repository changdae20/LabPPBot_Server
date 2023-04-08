import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    freezeTableName: true,
    tableName: 'achievements',
    timestamps: false,
})
export class Achievements extends Model<Achievements> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public type!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public tag!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public name!: string;
    
    @AllowNull(false)
    @Column(DataType.STRING)
    public description!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public counter_id!: Number;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public goal_counter!: Number;
}
