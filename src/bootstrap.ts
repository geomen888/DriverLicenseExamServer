import dotenv from "dotenv";
import { Service } from "moleculer";
import { connect } from "mongoose";

import { BotService } from "./bot/service";
import { broker } from "./broker";
    
dotenv.config();

const { MONGODB_URI, SERVICES, MONGODB_TIMEOUT } = process.env;

export const bootstrap = async () => {
    const services: string[] = (SERVICES || "").split(",")
        .map((s: string) => s.trim());
    const serviceMap: Map<string, typeof Service> = new Map<string, any>([
        ["bot", BotService],
    ]);
    services.forEach((name: string) => {
        const service = serviceMap.get(name);
        if (service) {
            broker.createService(service);
        }
    });

    await connect(
        MONGODB_URI || "mongodb://localhost:27017/local",
        {
            connectTimeoutMS: parseInt(MONGODB_TIMEOUT || "10000", 10),
            socketTimeoutMS: 120000,
        },
    );

    await broker.start();
    broker.logger.info(`❆ NODE Version: ${process.versions.node}`);
    broker.repl();
};
