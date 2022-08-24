import { CronJob } from "cron";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import flights, { Flight } from "skiplagged-node-api";
import moment from "moment";
import Pushbullet, { Device } from "pushbullet";

const pusher = new Pushbullet("");

import { config } from "./config";

const durationWeight = 0.2;
const priceWeight = 0.7;
function sortFlights(flight: Flight) {
    const { durationSeconds, price_pennies } = flight;
    return durationSeconds * durationWeight + price_pennies * priceWeight;
}

let device: Device | undefined;
function getDevice() {
    return new Promise<Device>((res, rej) => {
        if (device) {
            return res(device);
        }
        pusher.devices(
            {
                active: true,
                limit: 10,
            },
            (err, response) => {
                if (err) {
                    console.error("Error: ", err);
                    return rej(err);
                }
                const phone = response.devices.find(d => d.type === "android");
                if (phone) {
                    device = phone;
                    return res(device);
                }
                rej(new Error("No android device found"));
            },
        );
    });
}

function pushMessage(device: Device, message: string) {
    pusher.note(device.iden, "Flight Found", message, err => {
        if (err) {
            console.error("Error sending flight info to device: ", err);
        }
    });
}

function findFlights() {
    config.forEach(async flightOptions => {
        const foundFlights: {
            [key: string]: any;
        } = {};
        const { initialOffset, leaveDate, iterations, maxTravelTime, tripDuration, from, to } = flightOptions;

        let tripDurationType;
        switch (tripDuration[1]) {
            case "w":
                tripDurationType = "Week";
                break;
            case "M":
                tripDurationType = "Month";
                break;
            case "d":
                tripDurationType = "Day";
                break;
            default:
                throw "Unkown trip duration.";
        }
        const tripLength = `${tripDuration[0]} ${tripDurationType} Trip from ${from} to ${to}\n`;
        const cheapest: {
            price: number;
            flight: Flight | null;
        } = { price: Infinity, flight: null };
        for (let i = 0; i < iterations; i++) {
            try {
                if (leaveDate) {
                    const flightDate = moment(leaveDate).add(i, "d");
                    flightOptions.departureDate = flightDate.format("YYYY-MM-DD");
                    flightOptions.returnDate = flightDate.add(...tripDuration).format("YYYY-MM-DD");
                } else if (initialOffset) {
                    const flightDate = moment()
                        .add(...initialOffset)
                        .add(i, "d");
                    flightOptions.departureDate = flightDate.format("YYYY-MM-DD");
                    flightOptions.returnDate = flightDate.add(...tripDuration).format("YYYY-MM-DD");
                }
                const findedFlights = await flights(flightOptions);
                findedFlights.forEach(flight => {
                    if (flight.durationSeconds > maxTravelTime * 60 * 60) return;
                    const { flight_key } = flight;
                    foundFlights[flight_key] = flight;
                    if (flight.price_pennies < cheapest.price) {
                        cheapest.price = flight.price_pennies;
                        cheapest.flight = flight;
                    }
                });
            } catch (err) {
                console.error("Flight Search Error: ", err);
            }
        }
        const sortedFlights = _.sortBy(Object.values(foundFlights), sortFlights);
        if (process.env.NODE_ENV !== "prod") {
            fs.writeFileSync(path.resolve("./datas.json"), JSON.stringify(sortedFlights, null, 2));
        }
        const message =
            tripLength +
            `${sortedFlights
                .slice(0, 3)
                .map(({ departureTime, duration, price }: any) => {
                    return `Leaves ${departureTime}, takes ${duration.replace(/ $/g, "")}, costs ${price}`;
                })
                .join("\n")}`;
        const device = await getDevice();
        pushMessage(device, message);
        console.log(message);
    });
}
if (process.env.NODE_ENV === "prod") {
    new CronJob("0 */4 * * *", findFlights, undefined, true, "America/New_York", null, true);
} else {
    findFlights();
}
