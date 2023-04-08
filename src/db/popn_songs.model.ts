import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: 'popn_songs',
})
export class Popnsongs extends Model<Popnsongs> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public title!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public genre!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public diff!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public level!: Number;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick1!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick2!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick3!: string;

    @AllowNull(true)
    @Default("?")
    @Column(DataType.STRING)
    public bpm!: string;

    @AllowNull(true)
    @Default("??:??")
    @Column(DataType.STRING)
    public duration!: string;

    @AllowNull(true)
    @Default(0)
    @Column(DataType.BIGINT)
    public notes!: Number;
}
