"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cron_1 = require("cron");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var lodash_1 = __importDefault(require("lodash"));
var skiplagged_node_api_1 = __importDefault(require("skiplagged-node-api"));
var moment_1 = __importDefault(require("moment"));
var pushbullet_1 = __importDefault(require("pushbullet"));
var pusher = new pushbullet_1.default("o.4GfRqWgObeTP3MjSOFr6ZyFHd7FgBQkL");
var config_1 = require("./config");
var durationWeight = 0.2;
var priceWeight = 0.7;
function sortFlights(flight) {
    var durationSeconds = flight.durationSeconds, price_pennies = flight.price_pennies;
    return durationSeconds * durationWeight + price_pennies * priceWeight;
}
var device;
function getDevice() {
    return new Promise(function (res, rej) {
        if (device) {
            return device;
        }
        pusher.devices({
            active: true,
            limit: 10,
        }, function (err, response) {
            if (err) {
                console.error("Error: ", err);
                return rej(err);
            }
            var phone = response.devices.find(function (d) { return d.type === "android"; });
            if (phone) {
                device = phone;
                return res(device);
            }
            rej(new Error("No android device found"));
        });
    });
}
function pushMessage(device, message) {
    pusher.note(device.iden, "Flight Found", message, function (err) {
        if (err) {
            console.error("Error sending flight info to device: ", err);
        }
    });
}
function findFlights() {
    var _this = this;
    config_1.config.forEach(function (flightOptions) { return __awaiter(_this, void 0, void 0, function () {
        var foundFlights, initialOffset, leaveDate, iterations, maxTravelTime, tripDuration, from, to, tripDurationType, tripLength, cheapest, i, flightDate, flightDate, findedFlights, err_1, sortedFlights, message, device;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    foundFlights = {};
                    initialOffset = flightOptions.initialOffset, leaveDate = flightOptions.leaveDate, iterations = flightOptions.iterations, maxTravelTime = flightOptions.maxTravelTime, tripDuration = flightOptions.tripDuration, from = flightOptions.from, to = flightOptions.to;
                    console.log({ leaveDate: leaveDate });
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
                    tripLength = tripDuration[0] + " " + tripDurationType + " Trip from " + from + " to " + to + "\n";
                    cheapest = { price: Infinity, flight: null };
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < iterations)) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    if (leaveDate) {
                        flightDate = moment_1.default(leaveDate).add(i, "d");
                        flightOptions.departureDate = flightDate.format("YYYY-MM-DD");
                        flightOptions.returnDate = flightDate.add.apply(flightDate, __spread(tripDuration)).format("YYYY-MM-DD");
                    }
                    else if (initialOffset) {
                        flightDate = (_a = moment_1.default()).add.apply(_a, __spread(initialOffset)).add(i, "d");
                        flightOptions.departureDate = flightDate.format("YYYY-MM-DD");
                        flightOptions.returnDate = flightDate.add.apply(flightDate, __spread(tripDuration)).format("YYYY-MM-DD");
                    }
                    return [4 /*yield*/, skiplagged_node_api_1.default(flightOptions)];
                case 3:
                    findedFlights = _b.sent();
                    console.log("asdf: ", findedFlights);
                    findedFlights.forEach(function (flight) {
                        if (flight.durationSeconds > maxTravelTime * 60 * 60)
                            return;
                        var flight_key = flight.flight_key;
                        foundFlights[flight_key] = flight;
                        if (flight.price_pennies < cheapest.price) {
                            cheapest.price = flight.price_pennies;
                            cheapest.flight = flight;
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    console.error("Flight Search Error: ", err_1);
                    return [3 /*break*/, 5];
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    sortedFlights = lodash_1.default.sortBy(Object.values(foundFlights), sortFlights);
                    if (process.env.NODE_ENV !== "prod") {
                        fs.writeFileSync(path.resolve("./datas.json"), JSON.stringify(sortedFlights, null, 2));
                    }
                    message = tripLength +
                        ("" + sortedFlights
                            .slice(0, 3)
                            .map(function (_a) {
                            var departureTime = _a.departureTime, duration = _a.duration, price = _a.price;
                            return "Leaves " + departureTime + ", takes " + duration.replace(/ $/g, "") + ", costs " + price;
                        })
                            .join("\n"));
                    return [4 /*yield*/, getDevice()];
                case 7:
                    device = _b.sent();
                    pushMessage(device, message);
                    console.log(message);
                    return [2 /*return*/];
            }
        });
    }); });
}
if (process.env.NODE_ENV === "prod") {
    new cron_1.CronJob("0 */4 * * *", findFlights, undefined, true, "America/New_York", null, true);
}
else {
    findFlights();
}
//# sourceMappingURL=index.js.map