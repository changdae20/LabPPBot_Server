import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: 'iidx_songs',
})
export class IIDXSongs extends Model<IIDXSongs> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public title!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public genre!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick1!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick2!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public nick3!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public level!: Number;

    @AllowNull(false)
    @Column(DataType.STRING)
    public diff!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public version!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public url!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public bpm!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public notes!: Number;

    @AllowNull(false)
    @Column(DataType.STRING)
    public artist!: string;
}
