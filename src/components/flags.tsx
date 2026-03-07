// 3-letter codes — used for F1 2026 races
import aus from "../assets/flags/aus.svg";
import aut from "../assets/flags/aut.svg";
import aze from "../assets/flags/aze.svg";
import bel from "../assets/flags/bel.svg";
import bra from "../assets/flags/bra.svg";
import brn from "../assets/flags/brn.svg";
import can from "../assets/flags/can.svg";
import chn from "../assets/flags/chn.svg";
import esp from "../assets/flags/esp.svg";
import gbr from "../assets/flags/gbr.svg";
import hun from "../assets/flags/hun.svg";
import ita from "../assets/flags/ita.svg";
import jpn from "../assets/flags/jpn.svg";
import ksa from "../assets/flags/ksa.svg";
import mex from "../assets/flags/mex.svg";
import mon from "../assets/flags/mon.svg";
import ned from "../assets/flags/ned.svg";
import qat from "../assets/flags/qat.svg";
import sgp from "../assets/flags/sgp.svg";
import uae from "../assets/flags/uae.svg";
import usa from "../assets/flags/usa.svg";

export const flags = {
	// 3-letter (F1 2026 races)
	aus,
	aut,
	aze,
	bel,
	bra,
	brn,
	can,
	chn,
	esp,
	gbr,
	hun,
	ita,
	jpn,
	ksa,
	mex,
	mon,
	ned,
	qat,
	sgp,
	uae,
	usa,
	// 2-letter (legacy)
} as const;

export type CountryCode = keyof typeof flags;

export function Flag({ countryCode, className }: { countryCode: CountryCode; className?: string }) {
	return <img src={flags[countryCode]} alt={countryCode} className={className} />;
}
