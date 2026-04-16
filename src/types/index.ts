export interface Village {
    name: string;
    type?: string;
    population?: string;
    soil: string;
    crops: string;
}

export interface District {
    name: string;
    center: string;
    soil: string;
    crops: string;
    villages: Village[];
}

export interface Region {
    id: string;
    name: string;
    center: string;
    area: string;
    population: string;
    soil: string;
    crops: string;
    aiTip: string;
    districts: District[];
}

export interface WeatherInfo {
    temp: number;
    condition: string;
    humidity: number;
    sms: string;
}
