import * as dotenv from "dotenv";
import { BrokerOptions, LogLevels, ServiceBroker } from "moleculer";

import Utils from "./common/utils";

dotenv.config();

const {
  LOGGER, LOGLEVEL, TRANSPORTER, REGISTRY_STRATEGY, REQUESTTIMEOUT, CIRCUITBREAKER_ENABLED,
  SERIALIZER, NAMESPACE, CACHER,
} = process.env;

const opts: BrokerOptions = {
    cacher: CACHER || "Memory",
    circuitBreaker: {
        enabled: Utils.isEnvVarTrue(CIRCUITBREAKER_ENABLED || ""),
    },
    middlewares: [],
    namespace: NAMESPACE,
    registry: {
        strategy: REGISTRY_STRATEGY,
    },
    requestTimeout: parseInt(REQUESTTIMEOUT || "5000", 10),
    serializer: SERIALIZER,
    transporter: TRANSPORTER,
};

if (Utils.isEnvVarTrue(LOGGER || "")) {
    opts.logLevel = (LOGLEVEL || "info") as LogLevels;
    opts.logger = [
        {
            options: {
                autoPadding: false,
                colors: true,
                formatter: "full",
                level: (LOGLEVEL || "info") as LogLevels,
                moduleColors: false,
                objectPrinter: null,
            },
            type: "Console",
        },
    ];
}

export const broker = new ServiceBroker(opts);
