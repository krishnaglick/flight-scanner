declare module "pushbullet" {
    export default class Pushbullet {
        constructor(key: string, options?: ConstructorOptions): Pushbullet;
        me(callback: (err: Error, response: any) => void): void;
        devices(options: DevicesOptions, callback: (err: Error, response: DevicesResponse) => void): void;
        note(device: string, noteTitle: string, noteBody: string, callback: (err: Error, response: any) => void): void;
    }

    interface MeResponse {
        active: boolean;
        iden: string;
        created: number;
        modified: number;
        email: string;
        email_normalized: string;
        name: string;
        image_url: string;
        max_upload_size: number;
        pro: boolean;
        plan_id: string;
    }

    interface DevicesResponse {
        devices: Device[];
    }

    interface Device {
        active: boolean;
        iden: string;
        created: number;
        modified: number;
        type: string;
        kind: string;
        nickname: string;
        generated_nickname: boolean;
        manufacturer: string;
        model: string;
        app_version: number;
        fingerprint: string; // Stringified JSON
        push_token: string;
        pushable: boolean;
        has_sms: boolean;
        has_mms: boolean;
        icon: string;
        remote_files: string;
    }

    interface ConstructorOptions {
        fullResponses: boolean;
    }
    interface DevicesOptions {
        active?: boolean;
        cursor?: number;
        limit?: number;
    }
}
