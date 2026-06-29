export type MovementType =
    | 'AUTOMATIC'
    | 'MANUAL'
    | 'QUARTZ'
    | 'KINETIC';

export type WatchGender =
    | 'MENS'
    | 'WOMENS'
    | 'UNISEX';

export interface IModel {
    id: number;
    name: string;
    reference: string;
    movement_type: MovementType;
    gender: WatchGender;
}