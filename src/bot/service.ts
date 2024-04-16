import { Context, Service, ServiceBroker } from "moleculer";

export class BotService extends Service {
    constructor(broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            actions: {
                test: this.test,
            },
            events: {
            },
            name: "bot",
            started: this._started.bind(this),
        });
    }

    private dev = false;

    private async _started() {
        const {
            DEV
        } = process.env;
        this.dev = String(DEV).toLowerCase() === 'true'

    }


    async test(ctx: Context): Promise<void> {
        const { payload } = ctx.params as { payload: string };
        this.broker.logger.info("payload", payload);
    }


}
