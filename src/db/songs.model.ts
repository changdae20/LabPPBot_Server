import { Table, Model, Column, DataType, IsEmail, AllowNull, Default, HasOne, HasMany, PrimaryKey } from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: 'songs',
})
export class Songs extends Model<Songs> {

    @AllowNull(false)
    @Column(DataType.STRING)
    public title!: string;

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
    @Column(DataType.STRING)
    public code!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public level!: Number;
    
    @AllowNull(false)
    @Column(DataType.STRING)
    public artist!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public illustrator!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public effector!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public bpm!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    public chain_v!: Number;

    @AllowNull(false)
    @Column(DataType.STRING)
    public chain_vi!: Number;
    
    @AllowNull(false)
    @Column(DataType.STRING)
    public table_S!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    public table_PUC!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    public PUC_video_url!: string;
}
