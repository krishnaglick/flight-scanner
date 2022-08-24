declare module "skiplagged-node-api" {
    export default function skiplagged(config: Config): Promise<Flight[]>;

    export interface Flight {
        durationSeconds: number;
        flight_key: string;
        price_pennies: number;
    }
}
