import { DRIVERS } from "@/App/driver";
import type { DriverTag } from "@/shared/model";

const tagToNumber = new Map<DriverTag, number>(DRIVERS.map((d) => [d.acronym, d.number]));

const numberToTag = new Map<number, DriverTag>(DRIVERS.map((d) => [d.number, d.acronym]));

export function driverTagToNumber(tag: DriverTag): number | undefined {
	return tagToNumber.get(tag);
}

export function driverNumberToTag(num: number): DriverTag | undefined {
	return numberToTag.get(num);
}

export function resolvePosition(
	position: number | null,
	dnf: boolean,
	dns: boolean,
	dsq: boolean,
	totalDrivers: number
): number {
	if (dnf || dns || dsq || position === null) {
		return totalDrivers;
	}
	return position;
}
