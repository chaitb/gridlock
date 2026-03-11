import type { CircuitCode, CountryCode, RaceCode, Session } from "./model";

export class Race {
	readonly round: number;
	readonly code: RaceCode;
	readonly country: CountryCode;
	readonly name: string;
	readonly venue: string;
	readonly date: Date;
	readonly sprint: boolean;
	readonly circuit_key: number;
	readonly circuit_short_name: string;
	readonly circuit_code: CircuitCode;
	private readonly sessions: Session[];

	constructor(
		data: {
			round: number;
			code: RaceCode;
			country: CountryCode;
			name: string;
			venue: string;
			date: Date;
			sprint: boolean;
			circuit_key: number;
			circuit_short_name: string;
			circuit_code: CircuitCode;
		},
		sessions: Session[]
	) {
		this.round = data.round;
		this.code = data.code;
		this.country = data.country;
		this.name = data.name;
		this.venue = data.venue;
		this.date = data.date;
		this.sprint = data.sprint;
		this.circuit_key = data.circuit_key;
		this.circuit_short_name = data.circuit_short_name;
		this.circuit_code = data.circuit_code;
		this.sessions = sessions.filter((s) => s.circuit_code === data.circuit_code);
	}

	getSessions(): Session[] {
		return this.sessions;
	}

	getRaceStartDate(): Date {
		return new Date(this.getSessions().find((s) => s.session_type === "Race")?.date_start ?? "");
	}

	getStartDateString(): string {
		return this.getRaceStartDate().toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	isUpcoming(): boolean {
		const today = new Date();
		return this.getRaceStartDate() >= today;
	}

	isOpenForPredictions(): boolean {
		const today = new Date();
		return this.getPredictionLockDate() >= today;
	}

	getPredictionLockDate(): Date {
		return new Date(
			this.getSessions().find((s) => s.session_type === "Qualifying")?.date_start ?? ""
		);
	}

	getPredictionLockDateString(): string {
		return this.getPredictionLockDate().toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}
}
