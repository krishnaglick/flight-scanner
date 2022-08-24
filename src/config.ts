interface Config {
    from: string;
    to: string;
    resultsCount: number;
    tripDuration: string[];
    initialOffset?: string[];
    leaveDate: string;
    iterations: number;
    maxTravelTime: number;
    departureDate?: string;
    returnDate?: string;
}

export const config: Config[] = [
    {
        from: "MCO",
        to: "TYO",
        resultsCount: 3,
        tripDuration: ["2", "w"],
        leaveDate: "2020-03-10",
        iterations: 40,
        maxTravelTime: 24,
    } /*
  {
    from: "MCO",
    to: "TYO",
    resultsCount: 2,
    tripDuration: [1, "M"],
    initialOffset: [1, "M"],
    iterations: 30,
    maxTravelTime: 24,
  }*/,
    {
        from: "MCO",
        to: "BOS",
        resultsCount: 3,
        tripDuration: ["4", "d"],
        leaveDate: "2020-04-04",
        iterations: 1,
        maxTravelTime: 24,
    },
];
